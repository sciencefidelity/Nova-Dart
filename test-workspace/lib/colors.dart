import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';

final Map<String, Color> colorsPrimary = {
  'red': Colors.red,
  'pink': Colors.pink,
  'purple': Colors.purple,
  'deepPurple': Colors.deepPurple,
  'indigo': Colors.indigo,
  'blue': Colors.blue,
  'lightBlue': Colors.lightBlue,
  'teal': Colors.teal,
  'green': Colors.green,
  'lightGreen': Colors.lightGreen,
  'lime': Colors.lime,
  'yellow': Colors.yellow,
  'amber': Colors.amber,
  'orange': Colors.orange,
  'deepOrange': Colors.deepOrange,
  'brown': Colors.brown,
  'grey': Colors.grey,
  'blueGrey': Colors.blueGrey,
  'black': Colors.black,
  'white': Colors.white
};

final Map<String, Color> colorsAccent = {
  'red': Colors.redAccent,
  'pink': Colors.pinkAccent,
  'purple': Colors.purpleAccent,
  'deepPurple': Colors.deepPurpleAccent,
  'indigo': Colors.indigoAccent,
  'blue': Colors.blueAccent,
  'lightBlue': Colors.lightBlueAccent,
  'teal': Colors.tealAccent,
  'green': Colors.greenAccent,
  'lightGreen': Colors.lightGreenAccent,
  'lime': Colors.limeAccent,
  'yellow': Colors.yellowAccent,
  'amber': Colors.amberAccent,
  'orange': Colors.orangeAccent,
  'deepOrange': Colors.deepOrangeAccent,
};

final Map<String, Color?> colorsAmber = {
  'amber50': Colors.amber[50],
  'amber100': Colors.amber[100],
  'amber200': Colors.amber[200],
  'amber300': Colors.amber[300],
  'amber400': Colors.amber[400],
  'amber500': Colors.amber[500],
  'amber600': Colors.amber[600],
  'amber700': Colors.amber[700],
  'amber800': Colors.amber[800],
  'amber900': Colors.amber[900],
};

final Map<String, Color?> colorsAmberAccent = {
  'amberAccent100': Colors.amberAccent[100],
  'amberAccent200': Colors.amberAccent[200],
  'amberAccent400': Colors.amberAccent[400],
  'amberAccent700': Colors.amberAccent[700],
};

final Map<String, Color?> colorsBlue = {
  'blue50': Colors.blue[50],
  'blue100': Colors.blue[100],
  'blue200': Colors.blue[200],
  'blue300': Colors.blue[300],
  'blue400': Colors.blue[400],
  'blue500': Colors.blue[500],
  'blue600': Colors.blue[600],
  'blue700': Colors.blue[700],
  'blue800': Colors.blue[800],
  'blue900': Colors.blue[900],
};

final Map<String, Color?> colorsblueAccent = {
  'blueAccent100': Colors.blueAccent[100],
  'blueAccent200': Colors.blueAccent[200],
  'blueAccent400': Colors.blueAccent[400],
  'blueAccent700': Colors.blueAccent[700],
};

final Map<String, Color?> colorsBlueGrey = {
  'blueGrey50': Colors.blueGrey[50],
  'blueGrey100': Colors.blueGrey[100],
  'blueGrey200': Colors.blueGrey[200],
  'blueGrey300': Colors.blueGrey[300],
  'blueGrey400': Colors.blueGrey[400],
  'blueGrey500': Colors.blueGrey[500],
  'blueGrey600': Colors.blueGrey[600],
  'blueGrey700': Colors.blueGrey[700],
  'blueGrey800': Colors.blueGrey[800],
  'blueGrey900': Colors.blueGrey[900],
};

final Map<String, Color?> colorsBlack = {
  'black12': Colors.black12,
  'black26': Colors.black26,
  'black38': Colors.black38,
  'black45': Colors.black45,
  'black54': Colors.black54,
  'black87': Colors.black87,
};

final Map<String, Color?> colorsWhite = {
  'white10': Colors.white10,
  'white12': Colors.white12,
  'white24': Colors.white24,
  'white30': Colors.white30,
  'white38': Colors.white38,
  'white54': Colors.white54,
  'white60': Colors.white60,
  'white70': Colors.white70
};

final Map<String, Color?> cupertinoColors = {
  'black': CupertinoColors.black,
  'darkBackgroundGray': CupertinoColors.darkBackgroundGray,
  'extraLightBackgroundGray': CupertinoColors.extraLightBackgroundGray,
  'inactiveGray': CupertinoColors.inactiveGray,
  'label': CupertinoColors.label,
  'lightBackgroundGray': CupertinoColors.lightBackgroundGray,
  'link': CupertinoColors.link,
  'opaqueSeparator': CupertinoColors.opaqueSeparator,
  'placeholderText': CupertinoColors.placeholderText,
  'quaternaryLabel': CupertinoColors.quaternaryLabel,
  'quaternarySystemFill': CupertinoColors.quaternarySystemFill,
  'secondaryLabel': CupertinoColors.secondaryLabel,
  'secondarySystemBackground': CupertinoColors.secondarySystemBackground,
  'secondarySystemFill': CupertinoColors.secondarySystemFill,
  'secondarySystemGroupedBackground': CupertinoColors.secondarySystemGroupedBackground,
  'separator': CupertinoColors.separator,
  'systemBackground': CupertinoColors.systemBackground,
  'systemFill': CupertinoColors.systemFill,
  'systemGrey': CupertinoColors.systemGrey,
  'systemGrey2': CupertinoColors.systemGrey2,
  'systemGrey3': CupertinoColors.systemGrey3,
  'systemGrey4': CupertinoColors.systemGrey4,
  'systemGrey5': CupertinoColors.systemGrey5,
  'systemGrey6': CupertinoColors.systemGrey6,
  'systemGroupedBackground': CupertinoColors.systemGroupedBackground,
  'destructiveRed': CupertinoColors.destructiveRed,
  'systemRed': CupertinoColors.systemRed,
  'systemPink': CupertinoColors.systemPink,
  'systemPurple': CupertinoColors.systemPurple,
  'systemIndigo': CupertinoColors.systemIndigo,
  'activeBlue': CupertinoColors.activeBlue,
  'systemTeal': CupertinoColors.systemTeal,
  'activeGreen': CupertinoColors.activeGreen,
  'systemGreen': CupertinoColors.systemGreen,
  'systemYellow': CupertinoColors.systemYellow,
  'systemOrange': CupertinoColors.systemOrange,
  'activeOrange': CupertinoColors.activeOrange,
  'tertiaryLabel': CupertinoColors.tertiaryLabel,
  'tertiarySystemBackground': CupertinoColors.tertiarySystemBackground,
  'tertiarySystemFill': CupertinoColors.tertiarySystemFill,
  'tertiarySystemGroupedBackground': CupertinoColors.tertiarySystemGroupedBackground,
  'white': CupertinoColors.white
};

final Map<String, Color?> cupertinoColorsActiveBlue = {
  'activeBlue1': CupertinoColors.activeBlue.darkHighContrastElevatedColor,
  'activeBlue2': CupertinoColors.activeBlue.darkHighContrastColor,
  'activeBlue3': CupertinoColors.activeBlue.darkElevatedColor,
  'activeBlue4': CupertinoColors.activeBlue.darkColor,
  'activeBlue5': CupertinoColors.activeBlue.elevatedColor,
  'activeBlue0': CupertinoColors.activeBlue,
  'activeBlue6': CupertinoColors.activeBlue.highContrastColor,
  'activeBlue7': CupertinoColors.activeBlue.highContrastElevatedColor
};
