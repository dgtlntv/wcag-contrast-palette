/**
 * Converts a scale number to its target WCAG contrast ratio.
 * Uses r(x) = e^(3.04x) to ensure scale steps differing by 500+
 * achieve WCAG AA contrast (4.5:1) for accessibility.
 * Derived from https://mattstromawn.com/writing/generating-color-palettes/#putting-it-all-together%3A-all-the-code-you-need
 * Copyright (c) 2025 Matthew Ström-Awn
 * Licensed under MIT. See LICENSE file.
 * @param scaleValue - Scale number (0-1000)
 * @returns WCAG contrast ratio relative to scale 0
 */
export function scaleToContrast(scaleValue: number): number {
    const normalizedValue = scaleValue / 1000
    return Math.exp(3.04 * normalizedValue)
}

/**
 * Reverses WCAG contrast calculations to find a matching luminance
 * Derived from https://mattstromawn.com/writing/generating-color-palettes/#putting-it-all-together%3A-all-the-code-you-need
 * Copyright (c) 2025 Matthew Ström-Awn
 * Licensed under MIT. See LICENSE file.
 * @param contrast - Target contrast value (between 1 and 21)
 * @param y - Known luminance value (between 0 and 1)
 * @returns The calculated luminance value, or false if no valid solution exists
 */
export function reverseWCAGContrast(
    contrast: number = 4.5,
    y: number = 1
): number | false {
    if (!(y >= 0 && y <= 1)) {
        console.log("y is not a valid value (y >= 0 && y <= 1)")
        return false
    }

    if (!(contrast >= 1 && contrast <= 21)) {
        console.log(
            "contrast is not a valid value (contrast >= 1 && contrast <= 21)"
        )
        return false
    }

    let output: number

    // Calculate based on whether background is light or dark
    if (y > 0.18) {
        // Light background: calculate darker foreground
        output = (y + 0.05) / contrast - 0.05
    } else {
        // Dark background: calculate lighter foreground
        output = contrast * (y + 0.05) - 0.05
    }

    // Clamp output to valid luminance range
    return Math.max(0, Math.min(1, output))
}
