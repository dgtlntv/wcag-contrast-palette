import wcagContrast from "wcag-contrast"
import { generateColorScale } from "../src/generateColorScale.js"
import { scaleToContrast } from "../src/utils/reverseWcagContrast.js"

const grayscale = generateColorScale({
    baseHue: 0,
    minChroma: 0,
    maxChroma: 0,
    steps: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
})

console.log("Generated grayscale palette:")
console.log(grayscale)

const blackWhiteContrast = wcagContrast.rgb([0, 0, 0], [255, 255, 255])
console.log(
    `\nBlack [0,0,0] vs White [255,255,255] contrast: ${blackWhiteContrast}`
)

console.log("\nTesting contrast values:\n")

let allTestsPassed = true

// Test all reference points from 0 onwards
for (const referenceStep of [0, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
    if (referenceStep > 0) {
        console.log("\n" + "=".repeat(60))
    }
    console.log(
        `Testing contrast values (starting from step ${referenceStep}):\n`
    )

    const referenceColor = grayscale[referenceStep]
    const testSteps = [
        100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    ].filter((s) => s > referenceStep)

    for (const step of testSteps) {
        const testColor = grayscale[step]

        // Calculate WCAG contrast ratio
        const contrast = wcagContrast.rgb(
            [testColor[0], testColor[1], testColor[2]],
            [referenceColor[0], referenceColor[1], referenceColor[2]]
        )

        // Calculate expected contrast based on scale difference
        const relativeStep = step - referenceStep
        const expectedContrast = scaleToContrast(relativeStep)

        // WCAG contrast ranges from 1 to 21, with a margin of error for rounding
        const marginOfError = 0.5
        const difference = Math.abs(contrast - expectedContrast)
        const passed = difference <= marginOfError

        if (!passed) {
            allTestsPassed = false
        }

        console.log(
            `Step ${step.toString().padStart(3)}: ${Math.round(
                testColor[0]
            )}, ${Math.round(testColor[1])}, ${Math.round(
                testColor[2]
            )} vs ${Math.round(referenceColor[0])}, ${Math.round(
                referenceColor[1]
            )}, ${Math.round(referenceColor[2])}`
        )
        console.log(
            `  Expected: ${expectedContrast.toFixed(
                2
            )}, Got: ${contrast.toFixed(2)}, Difference: ${difference.toFixed(
                2
            )}${difference > 0 ? " (margin: ±0.5)" : ""} ${passed ? "✓" : "✗"}`
        )
    }
}

console.log("\n" + "=".repeat(60))
console.log("\nTesting WCAG AA compliance (500+ steps apart must have 4.5:1 contrast):\n")

// Test WCAG AA compliance: any colors at least 500 steps apart must have >= 4.5:1 contrast
const steps = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
let aaTestsPassed = true

for (let i = 0; i < steps.length; i++) {
    for (let j = i + 1; j < steps.length; j++) {
        const stepDifference = steps[j] - steps[i]

        // Only test pairs that are at least 500 steps apart
        if (stepDifference >= 500) {
            const color1 = grayscale[steps[i]]
            const color2 = grayscale[steps[j]]

            const contrast = wcagContrast.rgb(
                [color1[0], color1[1], color1[2]],
                [color2[0], color2[1], color2[2]]
            )

            const meetsAA = contrast >= 4.5

            if (!meetsAA) {
                aaTestsPassed = false
                allTestsPassed = false
            }

            console.log(
                `Step ${steps[i].toString().padStart(4)} to ${steps[j].toString().padStart(4)} (diff: ${stepDifference.toString().padStart(3)}): contrast = ${contrast.toFixed(2)} ${meetsAA ? "✓ (>= 4.5)" : "✗ (< 4.5)"}`
            )
        }
    }
}

console.log(
    `\n${aaTestsPassed ? "✓ All WCAG AA compliance tests passed!" : "✗ Some WCAG AA compliance tests failed"}`
)

console.log(
    `\n${allTestsPassed ? "✓ All tests passed!" : "✗ Some tests failed"}`
)

process.exit(allTestsPassed ? 0 : 1)
