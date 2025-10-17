import Color from "colorjs.io"

/**
 * Toe function to convert Oklab L to Okhsl L
 * Derived from https://bottosson.github.io/posts/colorpicker/#common-code
 * Copyright (c) 2021 Björn Ottosson
 * Licensed under MIT. See LICENSE file.
 * @param {number} L - Oklab L component (0-1)
 * @returns {number} OKHSl lightness value
 */
function toe(L: number): number {
    // Constants from the Okhsl definition for the toe function
    const k_1 = 0.206
    const k_2 = 0.03
    const k_3 = (1 + k_1) / (1 + k_2)

    const k3L_m_k1 = k_3 * L - k_1
    return (
        0.5 * (k3L_m_k1 + Math.sqrt(k3L_m_k1 * k3L_m_k1 + 4 * k_2 * k_3 * L))
    )
}

/**
 * Converts Y (luminance) value to Oklab lightness
 * Based on the formulas at: https://bottosson.github.io/posts/oklab/#converting-from-xyz-to-oklab
 * @param {number} inputY - Linear luminance value (0-1)
 * @returns {number} Oklab lightness value
 */
function yToOklabLightness(inputY: number): number {
    // D65 white point chromaticity coordinates
    const x = 0.3127
    const y = 0.329

    // Calculate X and Z factors for D65 grayscale
    const X_factor = x / y
    const Z_factor = (1 - x - y) / y

    // Calculate XYZ coordinates
    const X = X_factor * inputY
    const Y = inputY
    const Z = Z_factor * inputY

    // Step 1: Convert XYZ to approximate cone responses (LMS) using M1
    const M1 = [
        [+0.8189330101, +0.3618667424, -0.1288597137],
        [+0.0329845436, +0.9293118715, +0.0361456387],
        [+0.0482003018, +0.2643662691, +0.633851707],
    ]

    let l = M1[0][0] * X + M1[0][1] * Y + M1[0][2] * Z
    let m = M1[1][0] * X + M1[1][1] * Y + M1[1][2] * Z
    let s = M1[2][0] * X + M1[2][1] * Y + M1[2][2] * Z

    // Clamp LMS values to be non-negative before cube root
    l = Math.max(0, l)
    m = Math.max(0, m)
    s = Math.max(0, s)

    // Step 2: Apply non-linearity (cube root)
    const l_prime = Math.cbrt(l)
    const m_prime = Math.cbrt(m)
    const s_prime = Math.cbrt(s)

    // Step 3: Transform into Oklab coordinates using M2
    const M2 = [
        [+0.2104542553, +0.793617785, -0.0040720468],
        [+1.9779984951, -2.428592205, +0.4505937099],
        [+0.0259040371, +0.7827717662, -0.808675766],
    ]

    // Calculate only Oklab L (the first component)
    const L = M2[0][0] * l_prime + M2[0][1] * m_prime + M2[0][2] * s_prime

    return L
}

/**
 * Converts Y (luminance) value to Okhsl lightness
 * Derived from: https://bottosson.github.io/posts/colorpicker/#hsl-2
 * Copyright (c) 2021 Björn Ottosson
 * Licensed under MIT. See LICENSE file.
 * @param {number} inputY - Linear luminance value (0-1)
 * @returns {number} Okhsl lightness value
 */
export function yToOkhslLightness(inputY: number): number {
    return toe(yToOklabLightness(inputY))
}

/**
 * Converts OKHSl color to sRGB array
 * @param {OkHSL} hsl - Array containing [hue, saturation, lightness]
 *   hue: number (0-360) - The hue angle in degrees
 *   saturation: number (0-1) - The saturation value
 *   lightness: number (0-1) - The lightness value
 * @returns {[number, number, number]} sRGB array [r, g, b] in 0-255 range
 */
export function okhslToSrgb(
    hsl: [number, number, number]
): [number, number, number] {
    // Create new color in OKHSl space
    let c = new Color("okhsl", hsl)
    // Convert to sRGB color space
    c = c.to("srgb")

    return [c.srgb[0] * 255, c.srgb[1] * 255, c.srgb[2] * 255]
}

/**
 * Converts sRGB array to hex color string
 * @param {[number, number, number]} rgb - sRGB array [r, g, b] in 0-255 range
 * @returns {string} Hex color string (e.g., "#ff5733")
 */
export function srgbToHex(rgb: [number, number, number]): string {
    const c = new Color("srgb", [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255])
    return c.toString({ format: "hex" })
}
