import { MatchingEngine } from './matchingEngine.js';

function runTests() {
  console.log('Testing MatchingEngine...');
  const engine = new MatchingEngine('ETH/USDC', 3000);

  // Clear seed orders for controlled testing
  const depth = engine.getDepth(10);
  console.log(`Initial seed depth: ${depth.bids.length} bids, ${depth.asks.length} asks`);

  // Test 1: Place a limit sell order
  const sellResult = engine.createOrder({
    userId: 'seller-1',
    side: 'SELL',
    type: 'LIMIT',
    price: 3050,
    quantity: 1.0
  });
  console.log(`Placed sell limit: ${sellResult.order.id} status=${sellResult.order.status}`);

  // Test 2: Place matching limit buy order that fills it
  const buyResult = engine.createOrder({
    userId: 'buyer-1',
    side: 'BUY',
    type: 'LIMIT',
    price: 3050,
    quantity: 0.6
  });
  console.log(`Placed buy limit: fills=${buyResult.fills.length}, filledQty=${buyResult.order.filledQuantity}`);
  if (buyResult.fills.length === 0 || buyResult.fills[0].quantity !== 0.6) {
    throw new Error('Test failed: Partial fill expected');
  }

  const marketBuy = engine.createOrder({
    userId: 'market-buyer',
    side: 'BUY',
    type: 'MARKET',
    quantity: 0.4
  });
  console.log(`Market buy: filled=${marketBuy.order.filledQuantity}, status=${marketBuy.order.status}`);

  console.log('All MatchingEngine tests passed successfully!');
}

runTests();
