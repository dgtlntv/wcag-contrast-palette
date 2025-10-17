import { generateColorScale } from "./dist/src/generateColorScale.js";
import { srgbToHex } from "./dist/src/utils/colorConversions.js";

const expected = {
  gray: {
    20: "#F8F8F8",
    40: "#F1F1F1",
    100: "#DDDDDD",
    180: "#C5C5C5",
    280: "#A9A9A9",
    398: "#8C8C8C",
    520: "#717171",
    590: "#636363",
    700: "#4D4D4D",
    820: "#363636",
    930: "#1D1D1D",
    960: "#131313",
    990: "#060606"
  },
  orange: {
    20: "#FCF7F5",
    40: "#FAEEEB",
    100: "#F6D5CB",
    180: "#F5B39E",
    280: "#F68663",
    398: "#E95420",
    520: "#C13F0B",
    590: "#A9370C",
    700: "#832E10",
    820: "#592312",
    930: "#2E150D",
    960: "#200E08",
    990: "#0C0403"
  },
  teal: {
    20: "#F2FAFB",
    40: "#E4F5F7",
    100: "#B1E9F0",
    180: "#68D9E5",
    280: "#2DBECC",
    398: "#119FAB",
    520: "#07818B",
    590: "#09707A",
    700: "#0E585F",
    820: "#0F3D42",
    930: "#0A2123",
    960: "#071618",
    990: "#020708"
  },
  blue: {
    20: "#F5F8FC",
    40: "#ECF2FA",
    100: "#CEDFF6",
    180: "#A6C8F5",
    280: "#73ACF7",
    398: "#368BF6",
    520: "#0F6ED7",
    590: "#0D60BD",
    700: "#114C92",
    820: "#133662",
    930: "#0D1D32",
    960: "#091423",
    990: "#03060D"
  },
  purple: {
    20: "#F8F7FC",
    40: "#F1F0FA",
    100: "#DCDAF6",
    180: "#C4BDF6",
    280: "#A999FA",
    398: "#8F6EFC",
    520: "#793BF9",
    590: "#6C24E7",
    700: "#5325B0",
    820: "#382471",
    930: "#1D1737",
    960: "#130F25",
    990: "#06050E"
  },
  green: {
    20: "#F4FAF4",
    40: "#E8F6E7",
    100: "#BEECBC",
    180: "#86DE85",
    280: "#5CC45E",
    398: "#38A63E",
    520: "#25882C",
    590: "#26762A",
    700: "#275B28",
    820: "#1E3F1F",
    930: "#112111",
    960: "#0B170B",
    990: "#030703"
  },
  red: {
    20: "#FCF7F6",
    40: "#FAEEED",
    100: "#F6D4D1",
    180: "#F5B1AC",
    280: "#F7827C",
    398: "#F53E45",
    520: "#D0192D",
    590: "#B61928",
    700: "#8C1E23",
    820: "#5E1D1C",
    930: "#301211",
    960: "#210C0B",
    990: "#0C0403"
  },
  yellow: {
    20: "#FCF7F3",
    40: "#F9EFE6",
    100: "#F4D8BC",
    180: "#F2B87B",
    280: "#E59533",
    398: "#C3790D",
    520: "#9F6105",
    590: "#8B5505",
    700: "#6D4309",
    820: "#4B2F0D",
    930: "#281909",
    960: "#1C1106",
    990: "#090502"
  }
};

// Configuration from index.ts
const config = {
  steps: [0, 20, 40, 100, 180, 280, 398, 520, 590, 700, 820, 930, 960, 990, 1000],
  colors: {
    gray: { hue: 0, minChroma: 0, maxChroma: 0 },
    blue: { hue: 256, minChroma: 0.4, maxChroma: 0.967 },
    green: { hue: 144, minChroma: 0.4, maxChroma: 0.967 },
    red: { hue: 24, minChroma: 0.4, maxChroma: 0.967 },
    yellow: { hue: 67, minChroma: 0.4, maxChroma: 0.967 },
    purple: { hue: 290, minChroma: 0.4, maxChroma: 0.967 },
    teal: { hue: 205, minChroma: 0.4, maxChroma: 0.967 },
    orange: { hue: 38, minChroma: 0.4, maxChroma: 0.967 },
  }
};

// Generate colors on the fly
const generated = {};
for (const [colorName, colorDef] of Object.entries(config.colors)) {
  const scale = generateColorScale({
    baseHue: colorDef.hue,
    minChroma: colorDef.minChroma,
    maxChroma: colorDef.maxChroma,
    steps: config.steps,
    enableBezoldBruckeShift: false,
  });

  generated[colorName] = {};
  for (const [step, [r, g, b]] of Object.entries(scale)) {
    const roundedRgb = [Math.round(r), Math.round(g), Math.round(b)];
    generated[colorName][step] = srgbToHex(roundedRgb);
  }
}

// Normalize hex values to full 6-character format
function normalizeHex(hex) {
  const cleaned = hex.toLowerCase().replace('#', '');
  if (cleaned.length === 3) {
    // Expand abbreviated hex: each character is duplicated
    // e.g., "06c" -> "0066cc", "ddd" -> "dddddd"
    return cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  return cleaned;
}

console.log("Color Comparison Report\n");

for (const [colorName, expectedSteps] of Object.entries(expected)) {
  console.log(`\n${colorName.toUpperCase()}:`);
  console.log("=".repeat(60));

  for (const [step, expectedHex] of Object.entries(expectedSteps)) {
    const generatedHex = generated[colorName][step];
    const match = normalizeHex(expectedHex) === normalizeHex(generatedHex);
    console.log(`Step ${step.padStart(3)}: ${match ? '✓' : '✗'} Expected: ${expectedHex}, Generated: ${generatedHex}`);
  }
}
