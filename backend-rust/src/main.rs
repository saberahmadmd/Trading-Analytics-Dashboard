use rdkafka::config::ClientConfig;
use rdkafka::consumer::{CommitMode, Consumer, StreamConsumer};
use rdkafka::message::Message;
use rdkafka::producer::{FutureProducer, FutureRecord};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::time::Duration;

#[derive(Debug, Deserialize)]
struct TradeData {
    token_address: String,
    price_in_sol: f64,
    block_time: String,
    tx_hash: String,
    pool_address: String,
}

#[derive(Debug, Serialize)]
struct RsiData {
    token_address: String,
    rsi: f64,
    timestamp: String,
    price: f64,
}

struct TokenData {
    prices: Vec<f64>,
    rsi: f64,
}

impl TokenData {
    fn new() -> Self {
        Self {
            prices: Vec::new(),
            rsi: 50.0, // Default neutral RSI
        }
    }

    fn calculate_rsi(&mut self) -> f64 {
        if self.prices.len() < 15 {
            return 50.0; // Not enough data
        }

        let mut gains = 0.0;
        let mut losses = 0.0;

        for i in 1..self.prices.len() {
            let change = self.prices[i] - self.prices[i - 1];
            if change > 0.0 {
                gains += change;
            } else {
                losses -= change;
            }
        }

        let avg_gain = gains / 14.0;
        let avg_loss = losses / 14.0;

        if avg_loss == 0.0 {
            return 100.0;
        }

        let rs = avg_gain / avg_loss;
        let rsi = 100.0 - (100.0 / (1.0 + rs));

        self.rsi = rsi;
        rsi
    }

    fn add_price(&mut self, price: f64) {
        self.prices.push(price);
        if self.prices.len() > 50 {
            self.prices.remove(0);
        }
    }
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    let brokers = env::var("REDPANDA_BROKERS")
        .unwrap_or_else(|_| "localhost:19092".to_string());
    let trade_topic = env::var("TRADE_TOPIC")
        .unwrap_or_else(|_| "trade-data".to_string());
    let rsi_topic = env::var("RSI_TOPIC")
        .unwrap_or_else(|_| "rsi-data".to_string());

    println!("Starting RSI Calculator...");
    println!("Brokers: {}", brokers);
    println!("Trade Topic: {}", trade_topic);
    println!("RSI Topic: {}", rsi_topic);

    // Create consumer
    let consumer: StreamConsumer = ClientConfig::new()
        .set("bootstrap.servers", &brokers)
        .set("group.id", "rsi-calculator")
        .set("enable.partition.eof", "false")
        .set("auto.offset.reset", "earliest")
        .create()
        .expect("Consumer creation failed");

    // Create producer
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", &brokers)
        .set("message.timeout.ms", "5000")
        .create()
        .expect("Producer creation failed");

    consumer
        .subscribe(&[&trade_topic])
        .expect("Can't subscribe to specified topics");

    let mut token_data: HashMap<String, TokenData> = HashMap::new();
    let tracked_tokens = vec![
        "TOKEN1".to_string(),
        "TOKEN2".to_string(),
        "TOKEN3".to_string(),
        "TOKEN4".to_string(),
        "TOKEN5".to_string(),
    ];

    println!("Listening for trade data...");

    loop {
        match consumer.recv().await {
            Ok(message) => {
                let payload = match message.payload_view::<str>() {
                    Some(Ok(payload)) => payload,
                    Some(Err(e)) => {
                        eprintln!("Error while deserializing message payload: {:?}", e);
                        continue;
                    }
                    None => {
                        eprintln!("Received message with empty payload");
                        continue;
                    }
                };

                match serde_json::from_str::<TradeData>(payload) {
                    Ok(trade_data) => {
                        // Only process tracked tokens
                        if tracked_tokens.contains(&trade_data.token_address) {
                            let token_entry = token_data
                                .entry(trade_data.token_address.clone())
                                .or_insert_with(TokenData::new);

                            token_entry.add_price(trade_data.price_in_sol);
                            
                            if token_entry.prices.len() >= 15 {
                                let rsi = token_entry.calculate_rsi();

                                let rsi_data = RsiData {
                                    token_address: trade_data.token_address.clone(),
                                    rsi,
                                    timestamp: trade_data.block_time.clone(),
                                    price: trade_data.price_in_sol,
                                };

                                let json_rsi = serde_json::to_string(&rsi_data)
                                    .expect("Failed to serialize RSI data");

                                let record = FutureRecord::to(&rsi_topic)
                                    .payload(&json_rsi)
                                    .key(&trade_data.token_address);

                                match producer.send(record, Duration::from_secs(0)).await {
                                    Ok(_) => {
                                        println!(
                                            "Token: {}, Price: {:.6}, RSI: {:.2}",
                                            trade_data.token_address, trade_data.price_in_sol, rsi
                                        );
                                    }
                                    Err((e, _)) => {
                                        eprintln!("Error sending RSI data: {:?}", e);
                                    }
                                }
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("Error deserializing trade data: {:?}", e);
                    }
                }
            }
            Err(e) => {
                eprintln!("Kafka error: {:?}", e);
            }
        }
    }
}