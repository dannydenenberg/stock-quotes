import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts";
import * as yahooFinance from "./../yahoo-stock-prices.ts";

// Simple name and function, compact form, but not configurable
Deno.test("#1 Test callback for current price", async () => {
  await new Promise((resolve, reject) => {
    yahooFinance.getCurrentPrice("VTI", (err, price) => {
      assertEquals(typeof price, "number");

      resolve(1);
    });
  });
});

// Simple name and function, compact form, but not configurable
Deno.test("#2 Test promises for current price", async () => {
  let price = await yahooFinance.getCurrentPrice("VTI");
  assertEquals(typeof price, "number");
});

// Simple name and function, compact form, but not configurable
Deno.test("#3 Test callback for historical data", async () => {
  await new Promise((resolve, reject) => {
    yahooFinance.getHistoricalPrices(
      0,
      4,
      2020,
      0,
      4,
      2021,
      "vti",
      "1wk",
      (err, prices) => {
        if (err) {
          assertEquals(1, 0);
          reject(1);
        } else {
          assertEquals(typeof prices!.length, "number");
          resolve(1);
        }
      },
    );
  });
});

// Simple name and function, compact form, but not configurable
Deno.test("#4 Test promises for historical data", async () => {
  let prices = await yahooFinance.getHistoricalPrices(
    0,
    4,
    2020,
    0,
    4,
    2021,
    "vti",
    "1wk",
  );
  assertEquals(typeof prices?.length, "number");
});
