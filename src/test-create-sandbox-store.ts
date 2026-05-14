import PathaoService from "./app/modules/tenant/courier/pathao.service";

async function createSandboxStore() {
  console.log("🧪 Creating Sandbox Store...\n");

  try {
    const pathaoService = new PathaoService("sandbox");

    // ✅ Step 4: Store তৈরি করি
    console.log("📌 Step 4: Creating store...\n");
    const storeResponse = await pathaoService.createStore(
      "Test Store Sandbox 4503", // Store name
      "Test Merchant", // Contact name
      "01752736250", // Contact number
      "House 123, Road 4, Sector 10, Uttara, Dhaka-1230, Bangladesh", // Address
    );

    console.log("\n✅ Store created successfully!");
    console.log("Response:", storeResponse);

    // ✅ Output store_id
    if (storeResponse.data) {
      console.log("\n🎉 Store Details:");
      console.log("Store Name:", storeResponse.data.store_name);
      console.log("Store ID:", storeResponse.data.store_id);
      console.log("\n💾 Save this Store ID in your database!");
    }
  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

createSandboxStore();
