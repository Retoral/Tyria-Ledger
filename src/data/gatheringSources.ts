import type { GatheringDiscipline, GatheringNodeYield } from "../types";

export interface GatheringSourceSeed {
  itemName: string;
  itemId?: number;
  discipline: GatheringDiscipline;
  tool: string;
  toolTier?: string;
  node: string;
  mainYields: GatheringNodeYield[];
  extraYields: GatheringNodeYield[];
}

// Extracted from the GW2 Wiki Gathering page on 2026-06-23.
export const GATHERING_SOURCE_SEEDS: GatheringSourceSeed[] = [
  {
    "itemName": "Blueberry",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Blueberry Bush",
    "mainYields": [
      {
        "itemName": "Blueberry",
        "chance": "guaranteed",
        "itemId": 12255
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12255
  },
  {
    "itemName": "Mushroom",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Button Mushrooms",
    "mainYields": [
      {
        "itemName": "Mushroom",
        "chance": "guaranteed",
        "itemId": 12147
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12147
  },
  {
    "itemName": "Carrot",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Carrots",
    "mainYields": [
      {
        "itemName": "Carrot",
        "chance": "guaranteed",
        "itemId": 12134
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12134
  },
  {
    "itemName": "Black Peppercorn",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Patch",
    "mainYields": [
      {
        "itemName": "Black Peppercorn",
        "chance": "guaranteed",
        "itemId": 12236
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12236
  },
  {
    "itemName": "Parsley Leaf",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Patch",
    "mainYields": [
      {
        "itemName": "Parsley Leaf",
        "chance": "guaranteed",
        "itemId": 12246
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12246
  },
  {
    "itemName": "Thyme Leaf",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Patch",
    "mainYields": [
      {
        "itemName": "Thyme Leaf",
        "chance": "guaranteed",
        "itemId": 12248
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12248
  },
  {
    "itemName": "Black Peppercorn",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Seedlings",
    "mainYields": [
      {
        "itemName": "Black Peppercorn",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12236
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12236
  },
  {
    "itemName": "Chili Pepper",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Seedlings",
    "mainYields": [
      {
        "itemName": "Chili Pepper",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12331
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12331
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Seedlings",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Parsley Leaf",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Seedlings",
    "mainYields": [
      {
        "itemName": "Parsley Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12246
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12246
  },
  {
    "itemName": "Thyme Leaf",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Seedlings",
    "mainYields": [
      {
        "itemName": "Thyme Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12248
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12248
  },
  {
    "itemName": "Vanilla Bean",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Herb Seedlings",
    "mainYields": [
      {
        "itemName": "Vanilla Bean",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12234
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12234
  },
  {
    "itemName": "Head of Lettuce",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Lettuce",
    "mainYields": [
      {
        "itemName": "Head of Lettuce",
        "chance": "guaranteed",
        "itemId": 12238
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12238
  },
  {
    "itemName": "Onion",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Onions",
    "mainYields": [
      {
        "itemName": "Onion",
        "chance": "guaranteed",
        "itemId": 12142
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12142
  },
  {
    "itemName": "Potato",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Potato (node)",
    "mainYields": [
      {
        "itemName": "Potato",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12135
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12135
  },
  {
    "itemName": "Clam",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Clam (node)",
    "mainYields": [
      {
        "itemName": "Clam",
        "chance": "guaranteed",
        "itemId": 12327
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12327
  },
  {
    "itemName": "Pearl",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Clam (node)",
    "mainYields": [
      {
        "itemName": "Pearl",
        "chance": "guaranteed",
        "itemId": 24500
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 24500
  },
  {
    "itemName": "Bay Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Bay Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12247
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12247
  },
  {
    "itemName": "Black Peppercorn",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Black Peppercorn",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12236
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12236
  },
  {
    "itemName": "Chili Pepper",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Chili Pepper",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12331
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12331
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Oregano Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Oregano Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12244
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12244
  },
  {
    "itemName": "Parsley Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Parsley Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12246
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12246
  },
  {
    "itemName": "Sage Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Sage Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12243
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12243
  },
  {
    "itemName": "Thyme Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Thyme Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12248
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12248
  },
  {
    "itemName": "Vanilla Bean",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Herb Sprouts",
    "mainYields": [
      {
        "itemName": "Vanilla Bean",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12234
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12234
  },
  {
    "itemName": "Spinach Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Spinach",
    "mainYields": [
      {
        "itemName": "Spinach Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12241
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12241
  },
  {
    "itemName": "Strawberry",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Strawberry Patch",
    "mainYields": [
      {
        "itemName": "Strawberry",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12253
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12253
  },
  {
    "itemName": "Beet",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Taproots",
    "mainYields": [
      {
        "itemName": "Beet",
        "chance": "guaranteed",
        "itemId": 12161
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12161
  },
  {
    "itemName": "Carrot",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Taproots",
    "mainYields": [
      {
        "itemName": "Carrot",
        "chance": "guaranteed",
        "itemId": 12134
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12134
  },
  {
    "itemName": "Sage Leaf",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Taproots",
    "mainYields": [
      {
        "itemName": "Sage Leaf",
        "chance": "guaranteed",
        "itemId": 12243
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12243
  },
  {
    "itemName": "Turnip",
    "discipline": "Harvesting",
    "tool": "Iron Harvesting Sickle",
    "toolTier": "Iron",
    "node": "Taproots",
    "mainYields": [
      {
        "itemName": "Turnip",
        "chance": "guaranteed",
        "itemId": 12162
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12162
  },
  {
    "itemName": "Head of Cabbage",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Cabbage",
    "mainYields": [
      {
        "itemName": "Head of Cabbage",
        "chance": "guaranteed",
        "itemId": 12332
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12332
  },
  {
    "itemName": "Grape",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Grapes",
    "mainYields": [
      {
        "itemName": "Grape",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12341
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12341
  },
  {
    "itemName": "Kale Leaf",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Kale",
    "mainYields": [
      {
        "itemName": "Kale Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12333
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12333
  },
  {
    "itemName": "Beet",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Root Vegetables",
    "mainYields": [
      {
        "itemName": "Beet",
        "chance": "guaranteed",
        "itemId": 12161
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12161
  },
  {
    "itemName": "Carrot",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Root Vegetables",
    "mainYields": [
      {
        "itemName": "Carrot",
        "chance": "guaranteed",
        "itemId": 12134
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12134
  },
  {
    "itemName": "Turnip",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Root Vegetables",
    "mainYields": [
      {
        "itemName": "Turnip",
        "chance": "guaranteed",
        "itemId": 12162
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12162
  },
  {
    "itemName": "Yam",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Root Vegetables",
    "mainYields": [
      {
        "itemName": "Yam",
        "chance": "guaranteed",
        "itemId": 12329
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12329
  },
  {
    "itemName": "Mushroom",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Varied Mushrooms",
    "mainYields": [
      {
        "itemName": "Mushroom",
        "chance": "guaranteed",
        "itemId": 12147
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12147
  },
  {
    "itemName": "Portobello Mushroom",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Varied Mushrooms",
    "mainYields": [
      {
        "itemName": "Portobello Mushroom",
        "chance": "guaranteed",
        "itemId": 12334
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12334
  },
  {
    "itemName": "Bay Leaf",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Bay Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12247
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12247
  },
  {
    "itemName": "Black Peppercorn",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Black Peppercorn",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12236
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12236
  },
  {
    "itemName": "Chili Pepper",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Chili Pepper",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12331
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12331
  },
  {
    "itemName": "Dill Sprig",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Dill Sprig",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12336
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12336
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Parsley Leaf",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Parsley Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12246
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12246
  },
  {
    "itemName": "Rosemary Sprig",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Rosemary Sprig",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12335
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12335
  },
  {
    "itemName": "Sage Leaf",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Sage Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12243
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12243
  },
  {
    "itemName": "Sesame Seed",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Sesame Seed",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12342
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12342
  },
  {
    "itemName": "Thyme Leaf",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Young Herbs",
    "mainYields": [
      {
        "itemName": "Thyme Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12248
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12248
  },
  {
    "itemName": "Zucchini",
    "discipline": "Harvesting",
    "tool": "Steel Harvesting Sickle",
    "toolTier": "Steel",
    "node": "Zucchini (node)",
    "mainYields": [
      {
        "itemName": "Zucchini",
        "chance": "guaranteed",
        "itemId": 12330
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12330
  },
  {
    "itemName": "Blackberry",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Blackberries",
    "mainYields": [
      {
        "itemName": "Blackberry",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12537
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12537
  },
  {
    "itemName": "Head of Cauliflower",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Cauliflower",
    "mainYields": [
      {
        "itemName": "Head of Cauliflower",
        "chance": "guaranteed",
        "itemId": 12532
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12532
  },
  {
    "itemName": "Coral Chunk",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Coral",
    "mainYields": [
      {
        "itemName": "Coral Chunk",
        "chance": "guaranteed",
        "itemId": 24874
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 24874
  },
  {
    "itemName": "Coral Orb",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Coral",
    "mainYields": [
      {
        "itemName": "Coral Orb",
        "chance": "guaranteed",
        "itemId": 24510
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 24510
  },
  {
    "itemName": "Coral Tentacle",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Coral",
    "mainYields": [
      {
        "itemName": "Coral Tentacle",
        "chance": "guaranteed",
        "itemId": 24509
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 24509
  },
  {
    "itemName": "Bay Leaf",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Bay Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12247
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12247
  },
  {
    "itemName": "Chili Pepper",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Chili Pepper",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12331
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12331
  },
  {
    "itemName": "Coriander Seed",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Coriander Seed",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12531
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12531
  },
  {
    "itemName": "Dill Sprig",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Dill Sprig",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12336
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12336
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Mint Leaf",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Mint Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12536
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12536
  },
  {
    "itemName": "Rosemary Sprig",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Rosemary Sprig",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12335
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12335
  },
  {
    "itemName": "Sage Leaf",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Sage Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12243
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12243
  },
  {
    "itemName": "Sesame Seed",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Sesame Seed",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12342
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12342
  },
  {
    "itemName": "Thyme Leaf",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Thyme Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12248
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12248
  },
  {
    "itemName": "Vanilla Bean",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Mature Herbs",
    "mainYields": [
      {
        "itemName": "Vanilla Bean",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12234
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12234
  },
  {
    "itemName": "Portobello Mushroom",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Portobello Mushrooms",
    "mainYields": [
      {
        "itemName": "Portobello Mushroom",
        "chance": "guaranteed",
        "itemId": 12334
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12334
  },
  {
    "itemName": "Green Onion",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Scallions",
    "mainYields": [
      {
        "itemName": "Green Onion",
        "chance": "guaranteed",
        "itemId": 12533
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12533
  },
  {
    "itemName": "Onion",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Scallions",
    "mainYields": [
      {
        "itemName": "Onion",
        "chance": "guaranteed",
        "itemId": 12142
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12142
  },
  {
    "itemName": "Sugar Pumpkin",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Sugar Pumpkin (node)",
    "mainYields": [
      {
        "itemName": "Sugar Pumpkin",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12538
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12538
  },
  {
    "itemName": "Carrot",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Variegated Taproots",
    "mainYields": [
      {
        "itemName": "Carrot",
        "chance": "guaranteed",
        "itemId": 12134
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12134
  },
  {
    "itemName": "Rutabaga",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Variegated Taproots",
    "mainYields": [
      {
        "itemName": "Rutabaga",
        "chance": "guaranteed",
        "itemId": 12535
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12535
  },
  {
    "itemName": "Turnip",
    "discipline": "Harvesting",
    "tool": "Darksteel Harvesting Sickle",
    "toolTier": "Darksteel",
    "node": "Variegated Taproots",
    "mainYields": [
      {
        "itemName": "Turnip",
        "chance": "guaranteed",
        "itemId": 12162
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12162
  },
  {
    "itemName": "Artichoke",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Artichoke (node)",
    "mainYields": [
      {
        "itemName": "Artichoke",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12512
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12512
  },
  {
    "itemName": "Asparagus Spear",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Asparagus",
    "mainYields": [
      {
        "itemName": "Asparagus Spear",
        "chance": "guaranteed",
        "itemId": 12505
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12505
  },
  {
    "itemName": "Passion Fruit",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Blooming Passiflora",
    "mainYields": [
      {
        "itemName": "Passion Fruit",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 36731
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 36731
  },
  {
    "itemName": "Passion Flower",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Blooming Passiflora",
    "mainYields": [
      {
        "itemName": "Passion Flower",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 37907
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 37907
  },
  {
    "itemName": "Butternut Squash",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Butternut Squash (node)",
    "mainYields": [
      {
        "itemName": "Butternut Squash",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12511
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12511
  },
  {
    "itemName": "Cayenne Pepper",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cayenne Pepper (node)",
    "mainYields": [
      {
        "itemName": "Cayenne Pepper",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12504
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12504
  },
  {
    "itemName": "Chili Pepper",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Desert Herbs",
    "mainYields": [
      {
        "itemName": "Chili Pepper",
        "chance": "guaranteed",
        "itemId": 12331
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12331
  },
  {
    "itemName": "Coriander Seed",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Desert Herbs",
    "mainYields": [
      {
        "itemName": "Coriander Seed",
        "chance": "guaranteed",
        "itemId": 12531
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12531
  },
  {
    "itemName": "Sage Leaf",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Desert Herbs",
    "mainYields": [
      {
        "itemName": "Sage Leaf",
        "chance": "guaranteed",
        "itemId": 12243
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12243
  },
  {
    "itemName": "Sesame Seed",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Desert Herbs",
    "mainYields": [
      {
        "itemName": "Sesame Seed",
        "chance": "guaranteed",
        "itemId": 12342
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12342
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Herbs",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Lemongrass",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Herbs",
    "mainYields": [
      {
        "itemName": "Lemongrass",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12546
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12546
  },
  {
    "itemName": "Coriander Seed",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Herbs",
    "mainYields": [
      {
        "itemName": "Coriander Seed",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12531
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12531
  },
  {
    "itemName": "Tarragon Leaves",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Cluster of Herbs",
    "mainYields": [
      {
        "itemName": "Tarragon Leaves",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12506
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12506
  },
  {
    "itemName": "Cassava Root",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Desert Vegetables",
    "mainYields": [
      {
        "itemName": "Cassava Root",
        "chance": "guaranteed",
        "itemId": 73113
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 73113
  },
  {
    "itemName": "Flax Fiber",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Desert Vegetables",
    "mainYields": [
      {
        "itemName": "Flax Fiber",
        "chance": "guaranteed",
        "itemId": 75241
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 75241
  },
  {
    "itemName": "Grape",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Desert Vegetables",
    "mainYields": [
      {
        "itemName": "Grape",
        "chance": "guaranteed",
        "itemId": 12341
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12341
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Desert Vegetables",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Onion",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Desert Vegetables",
    "mainYields": [
      {
        "itemName": "Onion",
        "chance": "guaranteed",
        "itemId": 12142
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12142
  },
  {
    "itemName": "Green Onion",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Leeks",
    "mainYields": [
      {
        "itemName": "Green Onion",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12533
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12533
  },
  {
    "itemName": "Leek",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Leeks",
    "mainYields": [
      {
        "itemName": "Leek",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12508
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12508
  },
  {
    "itemName": "Passion Fruit",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Passiflora",
    "mainYields": [
      {
        "itemName": "Passion Fruit",
        "chance": "low_chance",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 36731
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 36731
  },
  {
    "itemName": "Passion Flower",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Passiflora",
    "mainYields": [
      {
        "itemName": "Passion Flower",
        "chance": "low_chance",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 37907
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 37907
  },
  {
    "itemName": "Raspberry",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Raspberries",
    "mainYields": [
      {
        "itemName": "Raspberry",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12254
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12254
  },
  {
    "itemName": "Clove",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Clove",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12534
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12534
  },
  {
    "itemName": "Head of Garlic",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Head of Garlic",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12163
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12163
  },
  {
    "itemName": "Mint Leaf",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Mint Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12536
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12536
  },
  {
    "itemName": "Sage Leaf",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Sage Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12243
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12243
  },
  {
    "itemName": "Tarragon Leaves",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Tarragon Leaves",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12506
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12506
  },
  {
    "itemName": "Thyme Leaf",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Thyme Leaf",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12248
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12248
  },
  {
    "itemName": "Vanilla Bean",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Verdant Herbs",
    "mainYields": [
      {
        "itemName": "Vanilla Bean",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12234
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12234
  },
  {
    "itemName": "Beet",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Winter Root Vegetables",
    "mainYields": [
      {
        "itemName": "Beet",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12161
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12161
  },
  {
    "itemName": "Parsnip",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Winter Root Vegetables",
    "mainYields": [
      {
        "itemName": "Parsnip",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12507
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12507
  },
  {
    "itemName": "Rutabaga",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Winter Root Vegetables",
    "mainYields": [
      {
        "itemName": "Rutabaga",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12535
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12535
  },
  {
    "itemName": "Turnip",
    "discipline": "Harvesting",
    "tool": "Mithril Harvesting Sickle",
    "toolTier": "Mithril",
    "node": "Winter Root Vegetables",
    "mainYields": [
      {
        "itemName": "Turnip",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12162
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12162
  },
  {
    "itemName": "Saffron Thread",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Black Crocus",
    "mainYields": [
      {
        "itemName": "Saffron Thread",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 12547
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12547
  },
  {
    "itemName": "Nopal",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Cactus",
    "mainYields": [
      {
        "itemName": "Nopal",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 66524
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 66524
  },
  {
    "itemName": "Prickly Pear",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Cactus",
    "mainYields": [
      {
        "itemName": "Prickly Pear",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 66522
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 66522
  },
  {
    "itemName": "Pile of Silky Sand",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Cactus",
    "mainYields": [
      {
        "itemName": "Pile of Silky Sand",
        "chance": "guaranteed",
        "note": "Dedicated Gardener achievement crop.",
        "itemId": 66608
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 66608
  },
  {
    "itemName": "Pile of Flax Seeds",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Flax",
    "mainYields": [
      {
        "itemName": "Pile of Flax Seeds",
        "chance": "guaranteed",
        "itemId": 74090
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 74090
  },
  {
    "itemName": "Flax Fiber",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Flax",
    "mainYields": [
      {
        "itemName": "Flax Fiber",
        "chance": "guaranteed",
        "itemId": 75241
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 75241
  },
  {
    "itemName": "Flax Blossom",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Flax",
    "mainYields": [
      {
        "itemName": "Flax Blossom",
        "chance": "guaranteed",
        "itemId": 74988
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 74988
  },
  {
    "itemName": "Hidden Treasure",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Flax",
    "mainYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "guaranteed",
        "itemId": 9267
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 9267
  },
  {
    "itemName": "Ghost Pepper",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Ghost Pepper (node)",
    "mainYields": [
      {
        "itemName": "Ghost Pepper",
        "chance": "guaranteed",
        "itemId": 12544
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12544
  },
  {
    "itemName": "Cassava Root",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Jungle Plants",
    "mainYields": [
      {
        "itemName": "Cassava Root",
        "chance": "guaranteed",
        "itemId": 73113
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 73113
  },
  {
    "itemName": "Flax Fiber",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Jungle Plants",
    "mainYields": [
      {
        "itemName": "Flax Fiber",
        "chance": "guaranteed",
        "itemId": 75241
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 75241
  },
  {
    "itemName": "Jungle Grass Seed",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Jungle Plants",
    "mainYields": [
      {
        "itemName": "Jungle Grass Seed",
        "chance": "guaranteed",
        "itemId": 70955
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 70955
  },
  {
    "itemName": "Maguuma Lily",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Jungle Plants",
    "mainYields": [
      {
        "itemName": "Maguuma Lily",
        "chance": "guaranteed",
        "itemId": 70957
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 70957
  },
  {
    "itemName": "Pile of Allspice Berries",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Jungle Plants",
    "mainYields": [
      {
        "itemName": "Pile of Allspice Berries",
        "chance": "guaranteed",
        "itemId": 73096
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 73096
  },
  {
    "itemName": "Handfuls of Red Lentils",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Lentils",
    "mainYields": [
      {
        "itemName": "Handfuls of Red Lentils",
        "chance": "guaranteed"
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ]
  },
  {
    "itemName": "Lotus Root",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Lotus",
    "mainYields": [
      {
        "itemName": "Lotus Root",
        "chance": "guaranteed",
        "itemId": 12510
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12510
  },
  {
    "itemName": "Mussel",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Mussels",
    "mainYields": [
      {
        "itemName": "Mussel",
        "chance": "guaranteed",
        "itemId": 74266
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 74266
  },
  {
    "itemName": "Freshwater Pearl",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Mussels",
    "mainYields": [
      {
        "itemName": "Freshwater Pearl",
        "chance": "guaranteed",
        "itemId": 76179
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 76179
  },
  {
    "itemName": "Piece of Mother-of-Pearl",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Mussels",
    "mainYields": [
      {
        "itemName": "Piece of Mother-of-Pearl",
        "chance": "guaranteed",
        "itemId": 71069
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 71069
  },
  {
    "itemName": "Omnomberry",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Omnomberries",
    "mainYields": [
      {
        "itemName": "Omnomberry",
        "chance": "guaranteed",
        "itemId": 12128
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12128
  },
  {
    "itemName": "Orrian Truffle",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Orrian Truffle (node)",
    "mainYields": [
      {
        "itemName": "Orrian Truffle",
        "chance": "guaranteed",
        "itemId": 12545
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12545
  },
  {
    "itemName": "Sawgill Mushroom",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Sawgill Mushrooms",
    "mainYields": [
      {
        "itemName": "Sawgill Mushroom",
        "chance": "guaranteed",
        "itemId": 73504
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 73504
  },
  {
    "itemName": "Giant Mushroom Spore",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Sawgill Mushrooms",
    "mainYields": [
      {
        "itemName": "Giant Mushroom Spore",
        "chance": "guaranteed",
        "itemId": 70759
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 70759
  },
  {
    "itemName": "Seaweed",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Seaweed (node)",
    "mainYields": [
      {
        "itemName": "Seaweed",
        "chance": "guaranteed",
        "itemId": 12509
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12509
  },
  {
    "itemName": "Snow Truffle",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Snow Truffle (node)",
    "mainYields": [
      {
        "itemName": "Snow Truffle",
        "chance": "guaranteed",
        "itemId": 12144
      }
    ],
    "extraYields": [
      {
        "itemName": "Dandelion Blossom",
        "chance": "chance",
        "note": "Occasionally yielded while harvesting terrestrial plants.",
        "itemId": 19620
      }
    ],
    "itemId": 12144
  },
  {
    "itemName": "Green Wood Log",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Aspen Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 19723
  },
  {
    "itemName": "Amber Pebble",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Aspen Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 24534
  },
  {
    "itemName": "Cinnamon Stick",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Aspen Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 12258
  },
  {
    "itemName": "Green Wood Log",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Ekku Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 19723
  },
  {
    "itemName": "Amber Pebble",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Ekku Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 24534
  },
  {
    "itemName": "Cinnamon Stick",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Ekku Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 12258
  },
  {
    "itemName": "Green Wood Log",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Kertch Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 19723
  },
  {
    "itemName": "Amber Pebble",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Kertch Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 24534
  },
  {
    "itemName": "Cinnamon Stick",
    "discipline": "Logging",
    "tool": "Copper Logging Axe",
    "toolTier": "Copper",
    "node": "Kertch Sapling",
    "mainYields": [
      {
        "itemName": "Green Wood Log",
        "chance": "guaranteed",
        "itemId": 19723
      }
    ],
    "extraYields": [
      {
        "itemName": "Amber Pebble",
        "chance": "chance",
        "itemId": 24534
      },
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      }
    ],
    "itemId": 12258
  },
  {
    "itemName": "Soft Wood Log",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Gummo Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 19726
  },
  {
    "itemName": "Cinnamon Stick",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Gummo Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12258
  },
  {
    "itemName": "Hidden Stash",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Gummo Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 9263
  },
  {
    "itemName": "Walnut",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Gummo Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12250
  },
  {
    "itemName": "Soft Wood Log",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Mimosa Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 19726
  },
  {
    "itemName": "Cinnamon Stick",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Mimosa Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12258
  },
  {
    "itemName": "Hidden Stash",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Mimosa Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 9263
  },
  {
    "itemName": "Walnut",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Mimosa Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12250
  },
  {
    "itemName": "Soft Wood Log",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Snow Cherry Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 19726
  },
  {
    "itemName": "Cinnamon Stick",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Snow Cherry Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12258
  },
  {
    "itemName": "Hidden Stash",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Snow Cherry Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 9263
  },
  {
    "itemName": "Walnut",
    "discipline": "Logging",
    "tool": "Iron Logging Axe",
    "toolTier": "Iron",
    "node": "Snow Cherry Sapling",
    "mainYields": [
      {
        "itemName": "Soft Wood Log",
        "chance": "guaranteed",
        "itemId": 19726
      }
    ],
    "extraYields": [
      {
        "itemName": "Cinnamon Stick",
        "chance": "chance",
        "itemId": 12258
      },
      {
        "itemName": "Hidden Stash",
        "chance": "chance",
        "itemId": 9263
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12250
  },
  {
    "itemName": "Seasoned Wood Log",
    "discipline": "Logging",
    "tool": "Steel Logging Axe",
    "toolTier": "Steel",
    "node": "Fir Sapling",
    "mainYields": [
      {
        "itemName": "Seasoned Wood Log",
        "chance": "guaranteed",
        "itemId": 19727
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Cache",
        "chance": "chance",
        "itemId": 9264
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 19727
  },
  {
    "itemName": "Hidden Cache",
    "discipline": "Logging",
    "tool": "Steel Logging Axe",
    "toolTier": "Steel",
    "node": "Fir Sapling",
    "mainYields": [
      {
        "itemName": "Seasoned Wood Log",
        "chance": "guaranteed",
        "itemId": 19727
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Cache",
        "chance": "chance",
        "itemId": 9264
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 9264
  },
  {
    "itemName": "Walnut",
    "discipline": "Logging",
    "tool": "Steel Logging Axe",
    "toolTier": "Steel",
    "node": "Fir Sapling",
    "mainYields": [
      {
        "itemName": "Seasoned Wood Log",
        "chance": "guaranteed",
        "itemId": 19727
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Cache",
        "chance": "chance",
        "itemId": 9264
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12250
  },
  {
    "itemName": "Seasoned Wood Log",
    "discipline": "Logging",
    "tool": "Steel Logging Axe",
    "toolTier": "Steel",
    "node": "Tukawa Sapling",
    "mainYields": [
      {
        "itemName": "Seasoned Wood Log",
        "chance": "guaranteed",
        "itemId": 19727
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Cache",
        "chance": "chance",
        "itemId": 9264
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 19727
  },
  {
    "itemName": "Hidden Cache",
    "discipline": "Logging",
    "tool": "Steel Logging Axe",
    "toolTier": "Steel",
    "node": "Tukawa Sapling",
    "mainYields": [
      {
        "itemName": "Seasoned Wood Log",
        "chance": "guaranteed",
        "itemId": 19727
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Cache",
        "chance": "chance",
        "itemId": 9264
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 9264
  },
  {
    "itemName": "Walnut",
    "discipline": "Logging",
    "tool": "Steel Logging Axe",
    "toolTier": "Steel",
    "node": "Tukawa Sapling",
    "mainYields": [
      {
        "itemName": "Seasoned Wood Log",
        "chance": "guaranteed",
        "itemId": 19727
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Cache",
        "chance": "chance",
        "itemId": 9264
      },
      {
        "itemName": "Walnut",
        "chance": "chance",
        "itemId": 12250
      }
    ],
    "itemId": 12250
  },
  {
    "itemName": "Hard Wood Log",
    "discipline": "Logging",
    "tool": "Darksteel Logging Axe",
    "toolTier": "Darksteel",
    "node": "Banyan Sapling",
    "mainYields": [
      {
        "itemName": "Hard Wood Log",
        "chance": "guaranteed",
        "itemId": 19724
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Hoard",
        "chance": "chance",
        "itemId": 9265
      }
    ],
    "itemId": 19724
  },
  {
    "itemName": "Hidden Hoard",
    "discipline": "Logging",
    "tool": "Darksteel Logging Axe",
    "toolTier": "Darksteel",
    "node": "Banyan Sapling",
    "mainYields": [
      {
        "itemName": "Hard Wood Log",
        "chance": "guaranteed",
        "itemId": 19724
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Hoard",
        "chance": "chance",
        "itemId": 9265
      }
    ],
    "itemId": 9265
  },
  {
    "itemName": "Hard Wood Log",
    "discipline": "Logging",
    "tool": "Darksteel Logging Axe",
    "toolTier": "Darksteel",
    "node": "Inglewood Sapling",
    "mainYields": [
      {
        "itemName": "Hard Wood Log",
        "chance": "guaranteed",
        "itemId": 19724
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Hoard",
        "chance": "chance",
        "itemId": 9265
      }
    ],
    "itemId": 19724
  },
  {
    "itemName": "Hidden Hoard",
    "discipline": "Logging",
    "tool": "Darksteel Logging Axe",
    "toolTier": "Darksteel",
    "node": "Inglewood Sapling",
    "mainYields": [
      {
        "itemName": "Hard Wood Log",
        "chance": "guaranteed",
        "itemId": 19724
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Hoard",
        "chance": "chance",
        "itemId": 9265
      }
    ],
    "itemId": 9265
  },
  {
    "itemName": "Hard Wood Log",
    "discipline": "Logging",
    "tool": "Darksteel Logging Axe",
    "toolTier": "Darksteel",
    "node": "Pine Sapling",
    "mainYields": [
      {
        "itemName": "Hard Wood Log",
        "chance": "guaranteed",
        "itemId": 19724
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Hoard",
        "chance": "chance",
        "itemId": 9265
      }
    ],
    "itemId": 19724
  },
  {
    "itemName": "Hidden Hoard",
    "discipline": "Logging",
    "tool": "Darksteel Logging Axe",
    "toolTier": "Darksteel",
    "node": "Pine Sapling",
    "mainYields": [
      {
        "itemName": "Hard Wood Log",
        "chance": "guaranteed",
        "itemId": 19724
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Hoard",
        "chance": "chance",
        "itemId": 9265
      }
    ],
    "itemId": 9265
  },
  {
    "itemName": "Elder Wood Log",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Baoba Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19722
  },
  {
    "itemName": "Hidden Trove",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Baoba Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9266
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Baoba Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Elder Wood Log",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Cypress Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19722
  },
  {
    "itemName": "Hidden Trove",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Cypress Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9266
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Cypress Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Elder Wood Log",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Red Oak Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19722
  },
  {
    "itemName": "Hidden Trove",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Red Oak Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9266
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Red Oak Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Elder Wood Log",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Palm Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19722
  },
  {
    "itemName": "Hidden Trove",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Palm Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9266
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Palm Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Elder Wood Log",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Mebahya Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19722
  },
  {
    "itemName": "Hidden Trove",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Mebahya Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9266
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Mebahya Sapling",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Elder Wood Log",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Spiderknot Tree",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19722
  },
  {
    "itemName": "Hidden Trove",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Spiderknot Tree",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9266
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Mithril Logging Axe",
    "toolTier": "Mithril",
    "node": "Spiderknot Tree",
    "mainYields": [
      {
        "itemName": "Elder Wood Log",
        "chance": "guaranteed",
        "itemId": 19722
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Trove",
        "chance": "chance",
        "itemId": 9266
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Ancient Wood Log",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Ancient Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19725
  },
  {
    "itemName": "Hidden Treasure",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Ancient Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9267
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Ancient Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Ancient Wood Log",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Orrian Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19725
  },
  {
    "itemName": "Hidden Treasure",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Orrian Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9267
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Orrian Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Ancient Wood Log",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Petrified Echovald Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19725
  },
  {
    "itemName": "Hidden Treasure",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Petrified Echovald Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9267
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Petrified Echovald Sapling",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Ancient Wood Log",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Ancient Spiderknot Tree",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 19725
  },
  {
    "itemName": "Hidden Treasure",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Ancient Spiderknot Tree",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 9267
  },
  {
    "itemName": "Foxfire Cluster",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Ancient Spiderknot Tree",
    "mainYields": [
      {
        "itemName": "Ancient Wood Log",
        "chance": "guaranteed",
        "itemId": 19725
      }
    ],
    "extraYields": [
      {
        "itemName": "Hidden Treasure",
        "chance": "chance",
        "itemId": 9267
      },
      {
        "itemName": "Foxfire Cluster",
        "chance": "chance",
        "itemId": 66933
      }
    ],
    "itemId": 66933
  },
  {
    "itemName": "Copper Ore",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Copper Ore (node)",
    "mainYields": [
      {
        "itemName": "Copper Ore",
        "chance": "guaranteed",
        "itemId": 19697
      }
    ],
    "extraYields": [
      {
        "itemName": "Garnet Pebble",
        "chance": "chance",
        "itemId": 24464
      },
      {
        "itemName": "Malachite Pebble",
        "chance": "chance",
        "itemId": 24466
      },
      {
        "itemName": "Tiger's Eye Pebble",
        "chance": "chance",
        "itemId": 24467
      },
      {
        "itemName": "Turquoise Pebble",
        "chance": "chance",
        "itemId": 24465
      }
    ],
    "itemId": 19697
  },
  {
    "itemName": "Garnet Pebble",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Copper Ore (node)",
    "mainYields": [
      {
        "itemName": "Copper Ore",
        "chance": "guaranteed",
        "itemId": 19697
      }
    ],
    "extraYields": [
      {
        "itemName": "Garnet Pebble",
        "chance": "chance",
        "itemId": 24464
      },
      {
        "itemName": "Malachite Pebble",
        "chance": "chance",
        "itemId": 24466
      },
      {
        "itemName": "Tiger's Eye Pebble",
        "chance": "chance",
        "itemId": 24467
      },
      {
        "itemName": "Turquoise Pebble",
        "chance": "chance",
        "itemId": 24465
      }
    ],
    "itemId": 24464
  },
  {
    "itemName": "Malachite Pebble",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Copper Ore (node)",
    "mainYields": [
      {
        "itemName": "Copper Ore",
        "chance": "guaranteed",
        "itemId": 19697
      }
    ],
    "extraYields": [
      {
        "itemName": "Garnet Pebble",
        "chance": "chance",
        "itemId": 24464
      },
      {
        "itemName": "Malachite Pebble",
        "chance": "chance",
        "itemId": 24466
      },
      {
        "itemName": "Tiger's Eye Pebble",
        "chance": "chance",
        "itemId": 24467
      },
      {
        "itemName": "Turquoise Pebble",
        "chance": "chance",
        "itemId": 24465
      }
    ],
    "itemId": 24466
  },
  {
    "itemName": "Tiger's Eye Pebble",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Copper Ore (node)",
    "mainYields": [
      {
        "itemName": "Copper Ore",
        "chance": "guaranteed",
        "itemId": 19697
      }
    ],
    "extraYields": [
      {
        "itemName": "Garnet Pebble",
        "chance": "chance",
        "itemId": 24464
      },
      {
        "itemName": "Malachite Pebble",
        "chance": "chance",
        "itemId": 24466
      },
      {
        "itemName": "Tiger's Eye Pebble",
        "chance": "chance",
        "itemId": 24467
      },
      {
        "itemName": "Turquoise Pebble",
        "chance": "chance",
        "itemId": 24465
      }
    ],
    "itemId": 24467
  },
  {
    "itemName": "Turquoise Pebble",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Copper Ore (node)",
    "mainYields": [
      {
        "itemName": "Copper Ore",
        "chance": "guaranteed",
        "itemId": 19697
      }
    ],
    "extraYields": [
      {
        "itemName": "Garnet Pebble",
        "chance": "chance",
        "itemId": 24464
      },
      {
        "itemName": "Malachite Pebble",
        "chance": "chance",
        "itemId": 24466
      },
      {
        "itemName": "Tiger's Eye Pebble",
        "chance": "chance",
        "itemId": 24467
      },
      {
        "itemName": "Turquoise Pebble",
        "chance": "chance",
        "itemId": 24465
      }
    ],
    "itemId": 24465
  },
  {
    "itemName": "Iron Ore",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 19699
  },
  {
    "itemName": "Silver Ore",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 19703
  },
  {
    "itemName": "Amethyst Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24501
  },
  {
    "itemName": "Carnelian Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24469
  },
  {
    "itemName": "Lapis Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24470
  },
  {
    "itemName": "Peridot Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24468
  },
  {
    "itemName": "Spinel Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24889
  },
  {
    "itemName": "Sunstone Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24471
  },
  {
    "itemName": "Topaz Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Iron Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24535
  },
  {
    "itemName": "Iron Ore",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 19699
  },
  {
    "itemName": "Silver Ore",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 19703
  },
  {
    "itemName": "Amethyst Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24501
  },
  {
    "itemName": "Carnelian Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24469
  },
  {
    "itemName": "Lapis Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24470
  },
  {
    "itemName": "Peridot Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24468
  },
  {
    "itemName": "Spinel Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24889
  },
  {
    "itemName": "Sunstone Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24471
  },
  {
    "itemName": "Topaz Nugget",
    "discipline": "Mining",
    "tool": "Iron Mining Pick",
    "toolTier": "Iron",
    "node": "Silver Ore (node)",
    "mainYields": [
      {
        "itemName": "Iron Ore",
        "chance": "guaranteed",
        "itemId": 19699
      },
      {
        "itemName": "Silver Ore",
        "chance": "guaranteed",
        "itemId": 19703
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Nugget",
        "chance": "chance",
        "itemId": 24501
      },
      {
        "itemName": "Carnelian Nugget",
        "chance": "chance",
        "itemId": 24469
      },
      {
        "itemName": "Lapis Nugget",
        "chance": "chance",
        "itemId": 24470
      },
      {
        "itemName": "Peridot Nugget",
        "chance": "chance",
        "itemId": 24468
      },
      {
        "itemName": "Spinel Nugget",
        "chance": "chance",
        "itemId": 24889
      },
      {
        "itemName": "Sunstone Nugget",
        "chance": "chance",
        "itemId": 24471
      },
      {
        "itemName": "Topaz Nugget",
        "chance": "chance",
        "itemId": 24535
      }
    ],
    "itemId": 24535
  },
  {
    "itemName": "Gold Ore",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 19698
  },
  {
    "itemName": "Amethyst Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24527
  },
  {
    "itemName": "Carnelian Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24472
  },
  {
    "itemName": "Lapis Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24507
  },
  {
    "itemName": "Peridot Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24504
  },
  {
    "itemName": "Spinel Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24526
  },
  {
    "itemName": "Sunstone Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24503
  },
  {
    "itemName": "Topaz Lump",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Gold Ore (node)",
    "mainYields": [
      {
        "itemName": "Gold Ore",
        "chance": "guaranteed",
        "itemId": 19698
      }
    ],
    "extraYields": [
      {
        "itemName": "Amethyst Lump",
        "chance": "chance",
        "itemId": 24527
      },
      {
        "itemName": "Carnelian Lump",
        "chance": "chance",
        "itemId": 24472
      },
      {
        "itemName": "Lapis Lump",
        "chance": "chance",
        "itemId": 24507
      },
      {
        "itemName": "Peridot Lump",
        "chance": "chance",
        "itemId": 24504
      },
      {
        "itemName": "Spinel Lump",
        "chance": "chance",
        "itemId": 24526
      },
      {
        "itemName": "Sunstone Lump",
        "chance": "chance",
        "itemId": 24503
      },
      {
        "itemName": "Topaz Lump",
        "chance": "chance",
        "itemId": 24506
      }
    ],
    "itemId": 24506
  },
  {
    "itemName": "Platinum Ore",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 19702
  },
  {
    "itemName": "Beryl Shard",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 24872
  },
  {
    "itemName": "Chrysocola Shard",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 24870
  },
  {
    "itemName": "Emerald Shard",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 24871
  },
  {
    "itemName": "Opal Shard",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 24875
  },
  {
    "itemName": "Ruby Shard",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 24873
  },
  {
    "itemName": "Sapphire Shard",
    "discipline": "Mining",
    "tool": "Darksteel Mining Pick",
    "toolTier": "Darksteel",
    "node": "Platinum Ore (node)",
    "mainYields": [
      {
        "itemName": "Platinum Ore",
        "chance": "guaranteed",
        "itemId": 19702
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Shard",
        "chance": "chance",
        "itemId": 24872
      },
      {
        "itemName": "Chrysocola Shard",
        "chance": "chance",
        "itemId": 24870
      },
      {
        "itemName": "Emerald Shard",
        "chance": "chance",
        "itemId": 24871
      },
      {
        "itemName": "Opal Shard",
        "chance": "chance",
        "itemId": 24875
      },
      {
        "itemName": "Ruby Shard",
        "chance": "chance",
        "itemId": 24873
      },
      {
        "itemName": "Sapphire Shard",
        "chance": "chance",
        "itemId": 24876
      }
    ],
    "itemId": 24876
  },
  {
    "itemName": "Mithril Ore",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 19700
  },
  {
    "itemName": "Beryl Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24519
  },
  {
    "itemName": "Chrysocola Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24511
  },
  {
    "itemName": "Emerald Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24473
  },
  {
    "itemName": "Opal Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24521
  },
  {
    "itemName": "Ruby Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24474
  },
  {
    "itemName": "Sapphire Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Mithril Ore (node)",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24475
  },
  {
    "itemName": "Mithril Ore",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 19700
  },
  {
    "itemName": "Beryl Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24519
  },
  {
    "itemName": "Chrysocola Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24511
  },
  {
    "itemName": "Emerald Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24473
  },
  {
    "itemName": "Opal Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24521
  },
  {
    "itemName": "Ruby Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24474
  },
  {
    "itemName": "Sapphire Crystal",
    "discipline": "Mining",
    "tool": "Mithril Mining Pick",
    "toolTier": "Mithril",
    "node": "Vesperite Ore",
    "mainYields": [
      {
        "itemName": "Mithril Ore",
        "chance": "guaranteed",
        "itemId": 19700
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Crystal",
        "chance": "chance",
        "itemId": 24519
      },
      {
        "itemName": "Chrysocola Crystal",
        "chance": "chance",
        "itemId": 24511
      },
      {
        "itemName": "Emerald Crystal",
        "chance": "chance",
        "itemId": 24473
      },
      {
        "itemName": "Opal Crystal",
        "chance": "chance",
        "itemId": 24521
      },
      {
        "itemName": "Ruby Crystal",
        "chance": "chance",
        "itemId": 24474
      },
      {
        "itemName": "Sapphire Crystal",
        "chance": "chance",
        "itemId": 24475
      }
    ],
    "itemId": 24475
  },
  {
    "itemName": "Orichalcum Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 19701
  },
  {
    "itemName": "Beryl Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24520
  },
  {
    "itemName": "Chrysocola Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24512
  },
  {
    "itemName": "Emerald Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24515
  },
  {
    "itemName": "Opal Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24522
  },
  {
    "itemName": "Ruby Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24508
  },
  {
    "itemName": "Sapphire Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Orichalcum Ore (node)",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24516
  },
  {
    "itemName": "Orichalcum Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 19701
  },
  {
    "itemName": "Beryl Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24520
  },
  {
    "itemName": "Chrysocola Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24512
  },
  {
    "itemName": "Emerald Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24515
  },
  {
    "itemName": "Opal Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24522
  },
  {
    "itemName": "Ruby Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24508
  },
  {
    "itemName": "Sapphire Orb",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Somnorite Ore",
    "mainYields": [
      {
        "itemName": "Orichalcum Ore",
        "chance": "guaranteed",
        "itemId": 19701
      }
    ],
    "extraYields": [
      {
        "itemName": "Beryl Orb",
        "chance": "chance",
        "itemId": 24520
      },
      {
        "itemName": "Chrysocola Orb",
        "chance": "chance",
        "itemId": 24512
      },
      {
        "itemName": "Emerald Orb",
        "chance": "chance",
        "itemId": 24515
      },
      {
        "itemName": "Opal Orb",
        "chance": "chance",
        "itemId": 24522
      },
      {
        "itemName": "Ruby Orb",
        "chance": "chance",
        "itemId": 24508
      },
      {
        "itemName": "Sapphire Orb",
        "chance": "chance",
        "itemId": 24516
      }
    ],
    "itemId": 24516
  },
  {
    "itemName": "Piece of Candy Corn",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Raw Candy Corn",
    "mainYields": [
      {
        "itemName": "Piece of Candy Corn",
        "chance": "guaranteed",
        "note": "Special node associated with Halloween.",
        "itemId": 36041
      }
    ],
    "extraYields": [
      {
        "itemName": "Trick-or-Treat Bag",
        "chance": "rare",
        "note": "Rare special-node yield associated with Halloween.",
        "itemId": 36038
      }
    ],
    "itemId": 36041
  },
  {
    "itemName": "Trick-or-Treat Bag",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Raw Candy Corn",
    "mainYields": [
      {
        "itemName": "Piece of Candy Corn",
        "chance": "guaranteed",
        "note": "Special node associated with Halloween.",
        "itemId": 36041
      }
    ],
    "extraYields": [
      {
        "itemName": "Trick-or-Treat Bag",
        "chance": "rare",
        "note": "Rare special-node yield associated with Halloween.",
        "itemId": 36038
      }
    ],
    "itemId": 36038
  },
  {
    "itemName": "Quartz Crystal",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Quartz Crystal Formation",
    "mainYields": [
      {
        "itemName": "Quartz Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "extraYields": [
      {
        "itemName": "Charged Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43772
      },
      {
        "itemName": "Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "itemId": 43773
  },
  {
    "itemName": "Charged Quartz Crystal",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Quartz Crystal Formation",
    "mainYields": [
      {
        "itemName": "Quartz Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "extraYields": [
      {
        "itemName": "Charged Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43772
      },
      {
        "itemName": "Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "itemId": 43772
  },
  {
    "itemName": "Quartz Crystal",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Rich Quartz Crystal Formation",
    "mainYields": [
      {
        "itemName": "Quartz Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "extraYields": [
      {
        "itemName": "Charged Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43772
      },
      {
        "itemName": "Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "itemId": 43773
  },
  {
    "itemName": "Charged Quartz Crystal",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Rich Quartz Crystal Formation",
    "mainYields": [
      {
        "itemName": "Quartz Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "extraYields": [
      {
        "itemName": "Charged Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43772
      },
      {
        "itemName": "Quartz Crystal",
        "chance": "rare",
        "quantity": "x5",
        "note": "Rare special-node yield associated with Dry Top Crystal Oasis Dragon's End.",
        "itemId": 43773
      }
    ],
    "itemId": 43772
  },
  {
    "itemName": "Watchwork Sprocket",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Sprocket Generator",
    "mainYields": [
      {
        "itemName": "Watchwork Sprocket",
        "chance": "guaranteed",
        "note": "Special node associated with Laurel Vendor.",
        "itemId": 44941
      }
    ],
    "extraYields": [
      {
        "itemName": "Blade Shard",
        "chance": "rare",
        "note": "Rare special-node yield associated with Laurel Vendor.",
        "itemId": 50025
      }
    ],
    "itemId": 44941
  },
  {
    "itemName": "Blade Shard",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Sprocket Generator",
    "mainYields": [
      {
        "itemName": "Watchwork Sprocket",
        "chance": "guaranteed",
        "note": "Special node associated with Laurel Vendor.",
        "itemId": 44941
      }
    ],
    "extraYields": [
      {
        "itemName": "Blade Shard",
        "chance": "rare",
        "note": "Rare special-node yield associated with Laurel Vendor.",
        "itemId": 50025
      }
    ],
    "itemId": 50025
  },
  {
    "itemName": "Bauble",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Bauble (node)",
    "mainYields": [
      {
        "itemName": "Bauble",
        "chance": "guaranteed",
        "note": "Special node associated with Super Adventure Box.",
        "itemId": 39752
      }
    ],
    "extraYields": [],
    "itemId": 39752
  },
  {
    "itemName": "Lump of Aurillium",
    "discipline": "Mining",
    "tool": "Steel Mining Pick",
    "toolTier": "Steel",
    "node": "Aurillium (node)",
    "mainYields": [
      {
        "itemName": "Lump of Aurillium",
        "chance": "guaranteed",
        "note": "Special node associated with Auric Basin.",
        "itemId": 75012
      }
    ],
    "extraYields": [],
    "itemId": 75012
  },
  {
    "itemName": "Bloodstone Dust",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Bloodstone Crystals",
    "mainYields": [
      {
        "itemName": "Bloodstone Dust",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen."
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen."
      },
      {
        "itemName": "Blood Ruby",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen.",
        "itemId": 79280
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Unbound Magic",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Bloodstone Crystals",
    "mainYields": [
      {
        "itemName": "Bloodstone Dust",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen."
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen."
      },
      {
        "itemName": "Blood Ruby",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen.",
        "itemId": 79280
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Blood Ruby",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Bloodstone Crystals",
    "mainYields": [
      {
        "itemName": "Bloodstone Dust",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen."
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen."
      },
      {
        "itemName": "Blood Ruby",
        "chance": "guaranteed",
        "note": "Special node associated with Bloodstone Fen.",
        "itemId": 79280
      }
    ],
    "extraYields": [],
    "itemId": 79280
  },
  {
    "itemName": "Empyreal Fragment",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Petrified Stump",
    "mainYields": [
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay.",
        "itemId": 46735
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay."
      },
      {
        "itemName": "Petrified Wood",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay.",
        "itemId": 79469
      }
    ],
    "extraYields": [],
    "itemId": 46735
  },
  {
    "itemName": "Unbound Magic",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Petrified Stump",
    "mainYields": [
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay.",
        "itemId": 46735
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay."
      },
      {
        "itemName": "Petrified Wood",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay.",
        "itemId": 79469
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Petrified Wood",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Petrified Stump",
    "mainYields": [
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay.",
        "itemId": 46735
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay."
      },
      {
        "itemName": "Petrified Wood",
        "chance": "guaranteed",
        "note": "Special node associated with Ember Bay.",
        "itemId": 79469
      }
    ],
    "extraYields": [],
    "itemId": 79469
  },
  {
    "itemName": "Fresh Winterberry",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Winterberry Bush",
    "mainYields": [
      {
        "itemName": "Fresh Winterberry",
        "chance": "guaranteed",
        "note": "Special node associated with Bitterfrost Frontier.",
        "itemId": 79899
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Bitterfrost Frontier."
      }
    ],
    "extraYields": [],
    "itemId": 79899
  },
  {
    "itemName": "Unbound Magic",
    "discipline": "Harvesting",
    "tool": "Copper Harvesting Sickle",
    "toolTier": "Copper",
    "node": "Winterberry Bush",
    "mainYields": [
      {
        "itemName": "Fresh Winterberry",
        "chance": "guaranteed",
        "note": "Special node associated with Bitterfrost Frontier.",
        "itemId": 79899
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Bitterfrost Frontier."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Jade Shard",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Jade Fragments",
    "mainYields": [
      {
        "itemName": "Jade Shard",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric.",
        "itemId": 80332
      },
      {
        "itemName": "Bloodstone Dust",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric."
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric."
      }
    ],
    "extraYields": [],
    "itemId": 80332
  },
  {
    "itemName": "Bloodstone Dust",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Jade Fragments",
    "mainYields": [
      {
        "itemName": "Jade Shard",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric.",
        "itemId": 80332
      },
      {
        "itemName": "Bloodstone Dust",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric."
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Unbound Magic",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Jade Fragments",
    "mainYields": [
      {
        "itemName": "Jade Shard",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric.",
        "itemId": 80332
      },
      {
        "itemName": "Bloodstone Dust",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric."
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Lake Doric."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Fire Orchid Blossom",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Primordial Orchid",
    "mainYields": [
      {
        "itemName": "Fire Orchid Blossom",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons.",
        "itemId": 81127
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons.",
        "itemId": 46735
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons."
      }
    ],
    "extraYields": [],
    "itemId": 81127
  },
  {
    "itemName": "Empyreal Fragment",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Primordial Orchid",
    "mainYields": [
      {
        "itemName": "Fire Orchid Blossom",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons.",
        "itemId": 81127
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons.",
        "itemId": 46735
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons."
      }
    ],
    "extraYields": [],
    "itemId": 46735
  },
  {
    "itemName": "Unbound Magic",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Primordial Orchid",
    "mainYields": [
      {
        "itemName": "Fire Orchid Blossom",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons.",
        "itemId": 81127
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons.",
        "itemId": 46735
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Draconis Mons."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Orrian Pearl",
    "discipline": "Mining",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Orrian Oyster",
    "mainYields": [
      {
        "itemName": "Orrian Pearl",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81706
      },
      {
        "itemName": "Oyster",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81837
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 46733
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing."
      }
    ],
    "extraYields": [],
    "itemId": 81706
  },
  {
    "itemName": "Oyster",
    "discipline": "Mining",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Orrian Oyster",
    "mainYields": [
      {
        "itemName": "Orrian Pearl",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81706
      },
      {
        "itemName": "Oyster",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81837
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 46733
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing."
      }
    ],
    "extraYields": [],
    "itemId": 81837
  },
  {
    "itemName": "Dragonite Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Orrian Oyster",
    "mainYields": [
      {
        "itemName": "Orrian Pearl",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81706
      },
      {
        "itemName": "Oyster",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81837
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 46733
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing."
      }
    ],
    "extraYields": [],
    "itemId": 46733
  },
  {
    "itemName": "Unbound Magic",
    "discipline": "Mining",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Orrian Oyster",
    "mainYields": [
      {
        "itemName": "Orrian Pearl",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81706
      },
      {
        "itemName": "Oyster",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 81837
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing.",
        "itemId": 46733
      },
      {
        "itemName": "Unbound Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Siren's Landing."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Kralkatite Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Brandstone Chunk",
    "mainYields": [
      {
        "itemName": "Kralkatite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86069
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 46733
      },
      {
        "itemName": "Powdered Rose Quartz",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86269
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan."
      }
    ],
    "extraYields": [
      {
        "itemName": "Rose Quartz",
        "chance": "rare",
        "note": "Rare special-node yield associated with Domain of Istan.",
        "itemId": 86316
      }
    ],
    "itemId": 86069
  },
  {
    "itemName": "Dragonite Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Brandstone Chunk",
    "mainYields": [
      {
        "itemName": "Kralkatite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86069
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 46733
      },
      {
        "itemName": "Powdered Rose Quartz",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86269
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan."
      }
    ],
    "extraYields": [
      {
        "itemName": "Rose Quartz",
        "chance": "rare",
        "note": "Rare special-node yield associated with Domain of Istan.",
        "itemId": 86316
      }
    ],
    "itemId": 46733
  },
  {
    "itemName": "Powdered Rose Quartz",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Brandstone Chunk",
    "mainYields": [
      {
        "itemName": "Kralkatite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86069
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 46733
      },
      {
        "itemName": "Powdered Rose Quartz",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86269
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan."
      }
    ],
    "extraYields": [
      {
        "itemName": "Rose Quartz",
        "chance": "rare",
        "note": "Rare special-node yield associated with Domain of Istan.",
        "itemId": 86316
      }
    ],
    "itemId": 86269
  },
  {
    "itemName": "Volatile Magic",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Brandstone Chunk",
    "mainYields": [
      {
        "itemName": "Kralkatite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86069
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 46733
      },
      {
        "itemName": "Powdered Rose Quartz",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86269
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan."
      }
    ],
    "extraYields": [
      {
        "itemName": "Rose Quartz",
        "chance": "rare",
        "note": "Rare special-node yield associated with Domain of Istan.",
        "itemId": 86316
      }
    ]
  },
  {
    "itemName": "Rose Quartz",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Brandstone Chunk",
    "mainYields": [
      {
        "itemName": "Kralkatite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86069
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 46733
      },
      {
        "itemName": "Powdered Rose Quartz",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan.",
        "itemId": 86269
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Domain of Istan."
      }
    ],
    "extraYields": [
      {
        "itemName": "Rose Quartz",
        "chance": "rare",
        "note": "Rare special-node yield associated with Domain of Istan.",
        "itemId": 86316
      }
    ],
    "itemId": 86316
  },
  {
    "itemName": "Difluorite Crystal",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Difluorite Crystals",
    "mainYields": [
      {
        "itemName": "Difluorite Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles.",
        "itemId": 86977
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles.",
        "itemId": 46735
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles."
      }
    ],
    "extraYields": [],
    "itemId": 86977
  },
  {
    "itemName": "Empyreal Fragment",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Difluorite Crystals",
    "mainYields": [
      {
        "itemName": "Difluorite Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles.",
        "itemId": 86977
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles.",
        "itemId": 46735
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles."
      }
    ],
    "extraYields": [],
    "itemId": 46735
  },
  {
    "itemName": "Volatile Magic",
    "discipline": "Logging",
    "tool": "Orichalcum Logging Axe",
    "toolTier": "Orichalcum",
    "node": "Difluorite Crystals",
    "mainYields": [
      {
        "itemName": "Difluorite Crystal",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles.",
        "itemId": 86977
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles.",
        "itemId": 46735
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Sandswept Isles."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Lump of Mistonium",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Mistonium",
    "mainYields": [
      {
        "itemName": "Lump of Mistonium",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs.",
        "itemId": 88955
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs.",
        "itemId": 46733
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs."
      }
    ],
    "extraYields": [],
    "itemId": 88955
  },
  {
    "itemName": "Dragonite Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Mistonium",
    "mainYields": [
      {
        "itemName": "Lump of Mistonium",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs.",
        "itemId": 88955
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs.",
        "itemId": 46733
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs."
      }
    ],
    "extraYields": [],
    "itemId": 46733
  },
  {
    "itemName": "Volatile Magic",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Mistonium",
    "mainYields": [
      {
        "itemName": "Lump of Mistonium",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs.",
        "itemId": 88955
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs.",
        "itemId": 46733
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Jahai Bluffs."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Branded Mass",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Dragon Crystal Node",
    "mainYields": [
      {
        "itemName": "Branded Mass",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks.",
        "itemId": 89537
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks.",
        "itemId": 46733
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks."
      }
    ],
    "extraYields": [],
    "itemId": 89537
  },
  {
    "itemName": "Dragonite Ore",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Dragon Crystal Node",
    "mainYields": [
      {
        "itemName": "Branded Mass",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks.",
        "itemId": 89537
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks.",
        "itemId": 46733
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks."
      }
    ],
    "extraYields": [],
    "itemId": 46733
  },
  {
    "itemName": "Volatile Magic",
    "discipline": "Mining",
    "tool": "Orichalcum Mining Pick",
    "toolTier": "Orichalcum",
    "node": "Dragon Crystal Node",
    "mainYields": [
      {
        "itemName": "Branded Mass",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks.",
        "itemId": 89537
      },
      {
        "itemName": "Dragonite Ore",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks.",
        "itemId": 46733
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Thunderhead Peaks."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Mistborn Mote",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Mistborn Mote (node)",
    "mainYields": [
      {
        "itemName": "Mistborn Mote",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall.",
        "itemId": 90783
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall.",
        "itemId": 46735
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall."
      }
    ],
    "extraYields": [],
    "itemId": 90783
  },
  {
    "itemName": "Empyreal Fragment",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Mistborn Mote (node)",
    "mainYields": [
      {
        "itemName": "Mistborn Mote",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall.",
        "itemId": 90783
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall.",
        "itemId": 46735
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall."
      }
    ],
    "extraYields": [],
    "itemId": 46735
  },
  {
    "itemName": "Volatile Magic",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Mistborn Mote (node)",
    "mainYields": [
      {
        "itemName": "Mistborn Mote",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall.",
        "itemId": 90783
      },
      {
        "itemName": "Empyreal Fragment",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall.",
        "itemId": 46735
      },
      {
        "itemName": "Volatile Magic",
        "chance": "guaranteed",
        "note": "Special node associated with Dragonfall."
      }
    ],
    "extraYields": []
  },
  {
    "itemName": "Hatched Chili",
    "discipline": "Harvesting",
    "tool": "Orichalcum Harvesting Sickle",
    "toolTier": "Orichalcum",
    "node": "Hatched Chili Pepper Bush",
    "mainYields": [
      {
        "itemName": "Hatched Chili",
        "chance": "guaranteed",
        "note": "Special node associated with Grothmar Valley.",
        "itemId": 92072
      }
    ],
    "extraYields": [],
    "itemId": 92072
  },
  {
    "itemName": "Eternal Ice Shard",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Eternal Ice",
    "mainYields": [
      {
        "itemName": "Eternal Ice Shard",
        "chance": "guaranteed",
        "note": "Special node associated with Bjora Marches.",
        "itemId": 92272
      }
    ],
    "extraYields": [],
    "itemId": 92272
  },
  {
    "itemName": "Prismaticite Crystal",
    "discipline": "Mining",
    "tool": "Copper Mining Pick",
    "toolTier": "Copper",
    "node": "Prismaticite (node)",
    "mainYields": [
      {
        "itemName": "Prismaticite Crystal",
        "chance": "guaranteed",
        "note": "Special gathering node.",
        "itemId": 94163
      }
    ],
    "extraYields": [],
    "itemId": 94163
  }
];
