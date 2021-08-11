import { flutterNamedColors } from "./colorsProvider"

interface ColorStrings {
  [key: string]: Color
}

export class DartColorAssistant implements ColorAssistant {
  hexRegex: RegExp
  argbHexRegex: RegExp
  argbRegex: RegExp
  rgboRegex: RegExp
  namedColors: ColorStrings

  constructor() {
    // Regexes
    // prettier-ignore
    this.hexRegex = new RegExp("Color\\(0x([A-F0-9]{8})\\)", 'i');
    // prettier-ignore
    this.argbHexRegex = new RegExp("Color\\.fromARGB\\(\\s*(0x[A-F0-9]{2}),\\s*(0x[A-F0-9]{2}),\\s*(0x[A-F0-9]{2}),\\s*(0x[A-F0-9]{2})\\s*\\)", "i");
    // prettier-ignore
    this.argbRegex = new RegExp("Color\\.fromARGB\\(\\s*([0-9]{1,3}),\\s*([0-9]{1,3}),\\s*([0-9]{1,3}),\\s*([0-9]{1,3})\\s*\\)", "i");
    // prettier-ignore
    this.rgboRegex = new RegExp("Color\\.fromRGBO\\(\\s*([0-9]{1,3}),\\s*([0-9]{1,3}),\\s*([0-9]{1,3}),\\s*([\\w_.]+)\\s*\\)", "i");

    // Named colors
    const namedColors: ColorStrings = {}
    const keys = Object.keys(flutterNamedColors)
    for (const key of keys) {
      const string = flutterNamedColors[key]

      const alpha = parseInt(string.substring(0, 2), 16) / 255.0
      const red = parseInt(string.substring(2, 4), 16) / 255.0
      const green = parseInt(string.substring(4, 6), 16) / 255.0
      const blue = parseInt(string.substring(6, 8), 16) / 255.0

      const color = Color.rgb(red, green, blue, alpha)
      namedColors[key] = color
    }
    this.namedColors = namedColors
  }
  // @ts-ignore: No unused params
  provideColors(editor: TextEditor, context: ColorInformationContext) {
    const regexes = [
      this.hexRegex,
      this.argbHexRegex,
      this.argbRegex,
      this.rgboRegex
    ]
    const colors = []

    const candidates = context.candidates
    for (const candidate of candidates) {
      const string = candidate.text
      const range = candidate.range

      // Named color
      const namedColor = this.namedColors[string]
      if (namedColor) {
        const infoRange = new Range(range.start, range.start + string.length)
        const colorInfo = new ColorInformation(infoRange, namedColor, "named")
        colors.push(colorInfo)
      }

      for (const regex of regexes) {
        const match = string.match(regex) as RegExpMatchArray
        if (match) {
          const color = this.parseColorMatch(match, regex, range)
          if (color) {
            colors.push(color)
            break
          }
        }
      }
    }
    return colors
  }

  parseColorMatch(match: RegExpMatchArray, regex: RegExp, range: Range) {
    // Parses a Dart color string into a color object
    const position = range.start + match.index!
    const matchStr = match[0]

    if (regex === this.hexRegex) {
      let alpha = parseInt(match[1].substring(0, 2), 16)
      let red = parseInt(match[1].substring(2, 4), 16)
      let green = parseInt(match[1].substring(4, 6), 16)
      let blue = parseInt(match[1].substring(6, 8), 16)

      alpha = alpha / 255.0
      red = red / 255.0
      green = green / 255.0
      blue = blue / 255.0

      const color = Color.rgb(red, green, blue, alpha)
      const range = new Range(position, position + matchStr.length)
      const info = new ColorInformation(range, color, "hex")
      info.format = ColorFormat.rgb
      return info
    } else if (regex === this.argbHexRegex) {
      let alpha = parseInt(match[1].substring(2, 4), 16)
      let red = parseInt(match[2].substring(2, 4), 16)
      let green = parseInt(match[3].substring(2, 4), 16)
      let blue = parseInt(match[4].substring(2, 4), 16)

      alpha = alpha / 255.0
      red = red / 255.0
      green = green / 255.0
      blue = blue / 255.0

      const color = Color.rgb(red, green, blue, alpha)
      const range = new Range(position, position + matchStr.length)
      const info = new ColorInformation(range, color, "hexa")
      info.format = ColorFormat.rgb
      return info
    } else if (regex === this.argbRegex) {
      let alpha = parseInt(match[1])
      let red = parseInt(match[2])
      let green = parseInt(match[3])
      let blue = parseInt(match[4])

      alpha = alpha / 255.0
      red = red / 255.0
      green = green / 255.0
      blue = blue / 255.0

      const color = Color.rgb(red, green, blue, alpha)
      const range = new Range(position, position + matchStr.length)
      const info = new ColorInformation(range, color, "rgba")
      info.format = ColorFormat.rgb
      return info
    } else if (regex === this.rgboRegex) {
      let red = parseInt(match[1])
      let green = parseInt(match[2])
      let blue = parseInt(match[3])
      const alpha = parseFloat(match[4])

      red = red / 255.0
      green = green / 255.0
      blue = blue / 255.0

      const color = Color.rgb(red, green, blue, alpha)
      const range = new Range(position, position + matchStr.length)
      const info = new ColorInformation(range, color, "srgb")
      info.format = ColorFormat.rgb
      return info
    }
    return null
  }
  // eslint-disable-next-line no-unused-vars
  provideColorPresentations(
    color: Color, // eslint-disable-next-line no-unused-vars
    editor: TextEditor, // eslint-disable-next-line no-unused-vars
    context: ColorPresentationContext
  ) {
    // Converts a color object into an array of color presentations
    const presentations = []

    // Constructor (hex)
    {
      const rgbColor = color.convert(ColorFormat.rgb)
      const components = rgbColor.components

      let alpha = Math.round(components[3] * 1000.0) / 1000.0
      let red = Math.round(components[0] * 1000.0) / 1000.0
      let green = Math.round(components[1] * 1000.0) / 1000.0
      let blue = Math.round(components[2] * 1000.0) / 1000.0

      alpha = alpha * 255.0
      red = red * 255.0
      green = green * 255.0
      blue = blue * 255.0

      let alphaHex = Math.floor(alpha).toString(16)
      if (alphaHex.length === 1) {
        alphaHex = "0" + alphaHex
      }
      let redHex = Math.floor(red).toString(16)
      if (redHex.length === 1) {
        redHex = "0" + redHex
      }
      let greenHex = Math.floor(green).toString(16)
      if (greenHex.length === 1) {
        greenHex = "0" + greenHex
      }
      let blueHex = Math.floor(blue).toString(16)
      if (blueHex.length === 1) {
        blueHex = "0" + blueHex
      }
      const string =
        "Color(0x" +
        alphaHex.toUpperCase() +
        redHex.toUpperCase() +
        greenHex.toUpperCase() +
        blueHex.toUpperCase() +
        ")"

      const presentation = new ColorPresentation(string, "hex")
      presentation.format = ColorFormat.rgb
      presentations.push(presentation)
    }

    // fromARGB (hex)
    {
      const rgbColor = color.convert(ColorFormat.rgb)
      const components = rgbColor.components

      let alpha = Math.round(components[3] * 1000.0) / 1000.0
      let red = Math.round(components[0] * 1000.0) / 1000.0
      let green = Math.round(components[1] * 1000.0) / 1000.0
      let blue = Math.round(components[2] * 1000.0) / 1000.0

      alpha = alpha * 255.0
      red = red * 255.0
      green = green * 255.0
      blue = blue * 255.0

      let alphaHex = Math.floor(alpha).toString(16)
      if (alphaHex.length === 1) {
        alphaHex = "0" + alphaHex
      }
      let redHex = Math.floor(red).toString(16)
      if (redHex.length === 1) {
        redHex = "0" + redHex
      }
      let greenHex = Math.floor(green).toString(16)
      if (greenHex.length === 1) {
        greenHex = "0" + greenHex
      }
      let blueHex = Math.floor(blue).toString(16)
      if (blueHex.length === 1) {
        blueHex = "0" + blueHex
      }

      const string =
        "Color.fromARGB(0x" +
        alphaHex.toUpperCase() +
        ", 0x" +
        redHex.toUpperCase() +
        ", 0x" +
        greenHex.toUpperCase() +
        ", 0x" +
        blueHex.toUpperCase() +
        ")"

      const presentation = new ColorPresentation(string, "hexa")
      presentation.format = ColorFormat.rgb
      presentations.push(presentation)
    }

    // fromARGB
    {
      const rgbColor = color.convert(ColorFormat.rgb)
      const components = rgbColor.components

      let alpha = Math.round(components[3] * 1000.0) / 1000.0
      let red = Math.round(components[0] * 1000.0) / 1000.0
      let green = Math.round(components[1] * 1000.0) / 1000.0
      let blue = Math.round(components[2] * 1000.0) / 1000.0

      alpha = alpha * 255.0
      red = red * 255.0
      green = green * 255.0
      blue = blue * 255.0

      const string =
        "Color.fromARGB(" +
        alpha.toFixed() +
        ", " +
        red.toFixed() +
        ", " +
        green.toFixed() +
        ", " +
        blue.toFixed() +
        ")"

      const presentation = new ColorPresentation(string, "rgba")
      presentation.format = ColorFormat.rgb
      presentations.push(presentation)
    }

    // fromRGBO
    {
      const rgbColor = color.convert(ColorFormat.rgb)
      const components = rgbColor.components

      let red = Math.round(components[0] * 1000.0) / 1000.0
      let green = Math.round(components[1] * 1000.0) / 1000.0
      let blue = Math.round(components[2] * 1000.0) / 1000.0
      const alpha = Math.round(components[3] * 1000.0) / 1000.0

      red = red * 255.0
      green = green * 255.0
      blue = blue * 255.0

      const string =
        "Color.fromRGBO(" +
        red.toFixed() +
        ", " +
        green.toFixed() +
        ", " +
        blue.toFixed() +
        ", " +
        alpha.toString() +
        ")"

      const presentation = new ColorPresentation(string, "srgb")
      presentation.format = ColorFormat.rgb
      presentations.push(presentation)
    }

    return presentations
  }
}
