const { Kafka } = require('kafkajs');
const csv = require('csv-parser');
const fs = require('fs');

const kafka = new Kafka({
  clientId: 'pumpfun-producer',
  brokers: ['localhost:19092']
});

const producer = kafka.producer();

const topic = 'trade-data';

async function main() {
  await producer.connect();
  console.log('Connected to Redpanda');

  const results = [];

  fs.createReadStream('trades_data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Read ${results.length} records from CSV`);
      
      for (const row of results) {
        try {
          const message = {
            value: JSON.stringify({
              token_address: row.token_address,
              price_in_sol: parseFloat(row.price_in_sol),
              block_time: row.block_time,
              tx_hash: row.tx_hash,
              pool_address: row.pool_address
            })
          };

          await producer.send({
            topic,
            messages: [message]
          });

          console.log(`Sent message for token: ${row.token_address}`);
          
          // Add delay to simulate real-time streaming
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }

      await producer.disconnect();
      console.log('All messages sent and producer disconnected');
    });
}

main().catch(console.error);