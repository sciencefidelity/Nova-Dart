interface ColorStrings {
  [key: string]: string[];
}

interface NamedStrings {
  [key: string]: string;
}

const namedColorStrings = {
  red: "F44336",
  pink: "E91E63",
  purple: "9C27B0",
  deepPurple: "673AB7",
  indigo: "3F51B5",
  blue: "2196F3",
  lightBlue: "00BCD4",
  teal: "009688",
  green: "4CAF50",
  lightGreen: "8BC34A",
  lime: "CDDC39",
  yellow: "FFEB3B",
  amber: "FFC107",
  orange: "FF9800",
  deepOrange: "FF5722",
  brown: "795548",
  grey: "9E9E9E",
  blueGrey: "607D8B",
  black: "000000",
  white: "FFFFFF",
} as NamedStrings;

export class DartColorAssistant implements ColorAssistant {
  attributeBlockChars: Charset;
  stringDoubleQuotedChars: Charset;
  stringSingleQuotedChars: Charset;
  attributeNameChars: string;
  valueDelimiterChars: Charset;
  hexRegex: RegExp;
  rgbRegex: RegExp;
  rgbaRegex: RegExp;
  hslRegex: RegExp;
  hslaRegex: RegExp;
  srgbRegex: RegExp;
  srgbaRegex: RegExp;
  displayP3Regex: RegExp;
  displayP3ARegex: RegExp;
  namedColors: any;

  constructor() {
    // Parsing charsets
    this.attributeBlockChars = new Charset("\\/{");
    this.stringDoubleQuotedChars = new Charset("\"\\");
    this.stringSingleQuotedChars = new Charset("'\\");
    this.attributeNameChars = Charset.alphanumeric.concat("-_");
    this.valueDelimiterChars = new Charset("/\"';");

    // Regexes
    this.hexRegex = new RegExp("#\\s*(?:(([a-fA-F0-9]{6}|[a-fA-F0-9]{3})|))\\s*", "i");
    this.rgbRegex = new RegExp("\\brgb\\(\\s*([0-9]{1,3})\\s*,\\s*([0-9]{1,3})\\s*,\\s*([0-9]{1,3})\\s*\\)", "i");
    this.rgbaRegex = new RegExp("\\brgba\\(\\s*([0-9]{1,3})\\s*,\\s*([0-9]{1,3})\\s*,\\s*([0-9]{1,3})\\s*,\\s*([0-9]*\.?[0-9]+)\\s*\\)", "i");
    this.hslRegex = new RegExp("\\bhsl\\(\\s*([0-9]{1,3})\\s*,\\s*([0-9]*\.?[0-9]+)%\\s*,\\s*([0-9]*\.?[0-9]+)%\\s*\\)", "i");
    this.hslaRegex = new RegExp("\\bhsla\\(\\s*([0-9]{1,3})\\s*,\\s*([0-9]*\.?[0-9]+)%\\s*,\\s*([0-9]*\.?[0-9]+)%\\s*,\\s*([0-9]*\.?[0-9]+)\\s*\\)", "i");
    this.srgbRegex = new RegExp("\\bcolor\\(\\s*srgb\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s*\\)", "i");
    this.srgbaRegex = new RegExp("\\bcolor\\(\\s*srgb\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s*(?:/\\s*([0-9]*\.?[0-9]+)\\s*)\\)", "i");
    this.displayP3Regex = new RegExp("\\bcolor\\(\\s*display-p3\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s*\\)", "i");
    this.displayP3ARegex = new RegExp("\\bcolor\\(\\s*display-p3\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s+([0-9]*\.?[0-9]+)\\s*(?:/\\s*([0-9]*\.?[0-9]+)\\s*)\\)", "i");

    // Named colors
    let namedColors: ColorStrings = {};
    let keys = Object.keys(namedColorStrings);
    for (let key of keys) {
      let string = namedColorStrings[key];

      let red = parseInt(string.substring(0, 2), 16) / 255.0;
      let green = parseInt(string.substring(2, 4), 16) / 255.0;
      let blue = parseInt(string.substring(4, 6), 16) / 255.0;

      let color = Color.rgb(red, green, blue, 1.0);
      namedColors[key] = color;
    }
    console.log(`namedColors: ${JSON.stringify(namedColors)}`);
    this.namedColors = namedColors;
  }

  provideColors(editor: TextEditor, context: ColorInformationContext) {
    let regexes = [this.hexRegex, this.rgbaRegex, this.rgbRegex, this.hslaRegex, this.hslRegex, this.srgbRegex, this.srgbaRegex, this.displayP3Regex, this.displayP3ARegex];

    let colors = [];
    let candidates = context.candidates;
    console.log(`candidates: ${JSON.stringify(candidates)}`);
    for (let candidate of candidates) {
      console.log(`candidate: ${JSON.stringify(candidate)}`);
      let string = candidate.text;
      let range = candidate.range;

      let namedColor = this.namedColors[string];
      if (namedColor) {
        // Named color
        console.log(`namedColor: ${namedColor}`);
        let infoRange = new Range(range.start, range.start + string.length);
        let colorInfo = new ColorInformation(infoRange, namedColor, "named");
        colors.push(colorInfo);
      }
      else {
        for (let regex of regexes) {
          let match = string.match(regex);
          if (match) {
            let color = this.parseColorMatch(match, regex, range);
            if (color) {
              colors.push(color);
              break;
            }
          }
        }
      }
    }
    console.log(`colors: ${JSON.stringify(colors)}`);
    return colors;
  }

  parseColorMatch(match: any, regex: RegExp, range: Range) {
    console.log("parseColorMatch");
    // Parses a Dart color string into an color object
    let position = range.start + match.index;
    let matchStr = match[0];
    if (regex === this.hexRegex) {
      if (matchStr.length === 10) {
        let red = parseInt(matchStr.substring(4, 6), 16);
        let green = parseInt(matchStr.substring(6, 8), 16);
        let blue = parseInt(matchStr.substring(8, 10), 16);

        red = red / 255.0;
        green = green / 255.0;
        blue = blue / 255.0;

        let color = Color.rgb(red, green, blue, 1.0);
        let range = new Range(position, position + matchStr.length);
        let info = new ColorInformation(range, color, "hex");
        info.format = ColorFormat.rgb;
        return info;
      }
      else if (matchStr.length === 4) {
        let redStr = matchStr.substring(1, 2);
        let greenStr = matchStr.substring(2, 3);
        let blueStr = matchStr.substring(3, 4);

        let red = parseInt(redStr + redStr, 16);
        let green = parseInt(greenStr + greenStr, 16);
        let blue = parseInt(blueStr + blueStr, 16);

        red = red / 255.0;
        green = green / 255.0;
        blue = blue / 255.0;

        let color = Color.rgb(red, green, blue, 1.0);
        let range = new Range(position, position + matchStr.length);
        let info = new ColorInformation(range, color, "hex");
        info.format = ColorFormat.rgb;
        return info;
      }
    }
    else if (regex == this.rgbaRegex) {
      let red = parseInt(match[1]);
      let green = parseInt(match[2]);
      let blue = parseInt(match[3]);
      let alpha = parseFloat(match[4]);

      red = red / 255.0;
      green = green / 255.0;
      blue = blue / 255.0;

      let color = Color.rgb(red, green, blue, alpha);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "rgba");
      info.format = ColorFormat.rgb;
      return info;
    }
    else if (regex == this.rgbRegex) {
      let red = parseInt(match[1]);
      let green = parseInt(match[2]);
      let blue = parseInt(match[3]);

      red = red / 255.0;
      green = green / 255.0;
      blue = blue / 255.0;

      let color = Color.rgb(red, green, blue, 1.0);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "rgb");
      info.format = ColorFormat.rgb;
      return info;
    }
    else if (regex == this.hslaRegex) {
      let hue = parseInt(match[1]);
      let sat = parseFloat(match[2]);
      let lum = parseFloat(match[3]);
      let alpha = parseFloat(match[4]);

      hue = hue / 360.0;
      sat = sat / 100.0;
      lum = lum / 100.0;

      let color = Color.hsl(hue, sat, lum, alpha);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "hsla");
      info.format = ColorFormat.hsl;
      return info;
    }
    else if (regex == this.hslRegex) {
      let hue = parseInt(match[1]);
      let sat = parseFloat(match[2]);
      let lum = parseFloat(match[3]);

      hue = hue / 360.0;
      sat = sat / 100.0;
      lum = lum / 100.0;

      let color = Color.hsl(hue, sat, lum, 1.0);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "hsl");
      info.format = ColorFormat.hsl;
      return info;
    }
    else if (regex == this.srgbRegex) {
      let red = parseFloat(match[1]);
      let green = parseFloat(match[2]);
      let blue = parseFloat(match[3]);

      let color = Color.rgb(red, green, blue);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "srgb");
      info.format = ColorFormat.rgb;
      info.usesFloats = true;
      return info;
    }
    else if (regex == this.srgbaRegex) {
      let red = parseFloat(match[1]);
      let green = parseFloat(match[2]);
      let blue = parseFloat(match[3]);
      let alpha = parseFloat(match[4]);

      let color = Color.rgb(red, green, blue, alpha);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "srgba");
      info.format = ColorFormat.rgb;
      info.usesFloats = true;
      return info;
    }
    else if (regex == this.displayP3Regex) {
      let red = parseFloat(match[1]);
      let green = parseFloat(match[2]);
      let blue = parseFloat(match[3]);

      let color = Color.displayP3(red, green, blue);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "p3");
      info.format = ColorFormat.displayP3;
      info.usesFloats = true;
      return info;
    }
    else if (regex == this.displayP3ARegex) {
      let red = parseFloat(match[1]);
      let green = parseFloat(match[2]);
      let blue = parseFloat(match[3]);
      let alpha = parseFloat(match[4]);

      let color = Color.displayP3(red, green, blue, alpha);
      let range = new Range(position, position + matchStr.length);
      let info = new ColorInformation(range, color, "p3a");
      info.format = ColorFormat.displayP3;
      info.usesFloats = true;
      return info;
    }
    console.log("parse color match");
    return null;
  }

  provideColorPresentations(color: any, context: any) {
    // Converts a color object into an array of color presentations
    let format = color.format;
    let presentations = [];

    if (format === ColorFormat.displayP3) {
      // Display P3
      let components = color.components;

      // Ensure a certain amount of rounding precision, to prevent very small exponent floats
      let red = Math.round(components[0] * 1000.0) / 1000.0;
      let green = Math.round(components[1] * 1000.0) / 1000.0;
      let blue = Math.round(components[2] * 1000.0) / 1000.0;
      let alpha = Math.round(components[3] * 1000.0) / 1000.0;

      // color(display-p3 r g b)
      if (alpha === 1.0) {
        let string = 'color(display-p3 ' + red.toString() + ' ' + green.toString() + ' ' + blue.toString() + ')';

        let presentation = new ColorPresentation(string, "p3");
        presentation.format = ColorFormat.displayP3;
        presentation.usesFloats = true;
        presentations.push(presentation);
      }

      // color(display-p3 r g b / a)
      {
        let string = 'color(display-p3 ' + red.toString() + ' ' + green.toString() + ' ' + blue.toString() + ' / ' + alpha.toString() + ')';

        let presentation = new ColorPresentation(string, "p3a");
        presentation.format = ColorFormat.displayP3;
        presentation.usesFloats = true;
        presentations.push(presentation);
      }
    }
    else {
      // color()
      {
        let rgbColor = color.convert(ColorFormat.rgb);
        let components = rgbColor.components;

        // Ensure a certain amount of rounding precision, to prevent very small exponent floats
        let red = Math.round(components[0] * 1000.0) / 1000.0;
        let green = Math.round(components[1] * 1000.0) / 1000.0;
        let blue = Math.round(components[2] * 1000.0) / 1000.0;
        let alpha = Math.round(components[3] * 1000.0) / 1000.0;

        // color(srgb r g b)
        if (alpha === 1.0) {
          let string = 'color(srgb ' + red.toString() + ' ' + green.toString() + ' ' + blue.toString() + ')';

          let presentation = new ColorPresentation(string, "srgb");
          presentation.format = ColorFormat.rgb;
          presentation.usesFloats = true;
          presentations.push(presentation);
        }

        // color(srgb r g b / a)
        {
          let string = 'color(srgb ' + red.toString() + ' ' + green.toString() + ' ' + blue.toString() + ' / ' + alpha.toString() + ')';

          let presentation = new ColorPresentation(string, "srgba");
          presentation.format = ColorFormat.rgb;
          presentation.usesFloats = true;
          presentations.push(presentation);
        }
      }

      // RGB
      {
        let rgbColor = color.convert(ColorFormat.rgb);
        let components = rgbColor.components;

        let red = Math.round(components[0] * 1000.0) / 1000.0;
        let green = Math.round(components[1] * 1000.0) / 1000.0;
        let blue = Math.round(components[2] * 1000.0) / 1000.0;
        let alpha = Math.round(components[3] * 1000.0) / 1000.0;

        red = red * 255.0;
        green = green * 255.0;
        blue = blue * 255.0;

        // rgb()
        if (alpha == 1.0) {
          let string = 'rgb(' + red.toFixed() + ', ' + green.toFixed() + ', ' + blue.toFixed() + ')';

          let presentation = new ColorPresentation(string, "rgb");
          presentation.format = ColorFormat.rgb;
          presentations.push(presentation);
        }

        // rgba()
        {
          let string = 'rgba(' + red.toFixed() + ', ' + green.toFixed() + ', ' + blue.toFixed() + ', ' + alpha.toString() + ')';

          let presentation = new ColorPresentation(string, "rgba");
          presentation.format = ColorFormat.rgb;
          presentations.push(presentation);
        }
      }

      // HSL
      {
        let hslColor = color.convert(ColorFormat.hsl);
        let components = hslColor.components;

        let hue = Math.round(components[0] * 1000.0) / 1000.0;
        let sat = Math.round(components[1] * 1000.0) / 1000.0;
        let lum = Math.round(components[2] * 1000.0) / 1000.0;
        let alpha = Math.round(components[3] * 1000.0) / 1000.0;

        hue = hue * 360.0;
        sat = sat * 100.0;
        lum = lum * 100.0;

        // hsl()
        if (alpha === 1.0) {
          let string = 'hsl(' + hue.toFixed() + ', ' + sat.toFixed() + '%, ' + lum.toFixed() + '%)';

          let presentation = new ColorPresentation(string, "hsl");
          presentation.format = ColorFormat.hsl;
          presentations.push(presentation);
        }

        // hsla()
        {
          let string = 'hsla(' + hue.toFixed() + ', ' + sat.toFixed() + '%, ' + lum.toFixed() + '%, ' + alpha.toString() + ')';

          let presentation = new ColorPresentation(string, "hsla");
          presentation.format = ColorFormat.hsl;
          presentations.push(presentation);
        }
      }

      // Hex
      {
        let rgbColor = color.convert(ColorFormat.rgb);
        let components = rgbColor.components;

        let red = Math.round(components[0] * 1000.0) / 1000.0;
        let green = Math.round(components[1] * 1000.0) / 1000.0;
        let blue = Math.round(components[2] * 1000.0) / 1000.0;

        red = red * 255.0;
        green = green * 255.0;
        blue = blue * 255.0;

        let redHex = Math.floor(red).toString(16);
        if (redHex.length === 1) {
            redHex = '0' + redHex;
        }
        let greenHex = Math.floor(green).toString(16);
        if (greenHex.length === 1) {
            greenHex = '0' + greenHex;
        }
        let blueHex = Math.floor(blue).toString(16);
        if (blueHex.length === 1) {
            blueHex = '0' + blueHex;
        }

        let string = '#' + redHex + greenHex + blueHex;

        let presentation = new ColorPresentation(string, "hex");
        presentation.format = ColorFormat.rgb;
        presentations.push(presentation);
      }
    }
    console.log("presentations");
    return presentations;
  }
}
