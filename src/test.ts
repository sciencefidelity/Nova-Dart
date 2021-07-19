let color = new Color(ColorFormat.rgb, [1, 0, 0.5, 1]);

color.format == ColorFormat.rgb ==> true;

let red = color.components[0];
let green = color.components[1];
let blue = color.components[2];
let alpha = color.components[3];
