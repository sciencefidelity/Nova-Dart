import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.grey[900],
      ),
      home: MyHomePage(title: 'Color Picker'),
    ); // MaterialApp
  }
}

class MyHomePage extends StatefulWidget {
  final String title;

  MyHomePage({Key? key, required this.title}) : super(key: key);

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final Map<String, Color> colors = {
    'blue': Color.fromRGBO(33, 152, 223, 1),
    'teal': Color.fromRGBO(55, 179, 159, 1),
    'green': Color.fromRGBO(89, 190, 73, 1),
    'yellow': Color.fromRGBO(233, 189, 49, 1),
    'orange': Color.fromRGBO(242, 109, 76, 1),
    'pink': Color.fromRGBO(232, 78, 139, 1),
    'purple': Color.fromRGBO(138, 86, 208, 1)
  };

  Color? selectedColor;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: selectedColor ?? Colors.black,
      ), // AppBar
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (var entry in colors.entries)
            Container(
              margin: EdgeInsets.all(10),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                    primary: entry.value, minimumSize: Size(300, 60)),
                child: Text(''),
                onPressed: () => _setColor(entry.key, entry.value),
              ), // ElevatedButton
            ), // Container
        ],
      ), // Column
    ); // Scaffold
  }

  @override
  void initState() {
    _getStoredColor();
    super.initState();
  }

  void _getStoredColor() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? colorName = prefs.getString('color');
    setState(() {
      selectedColor = colors[colorName];
    });
  }

  void _setColor(String colorName, Color color) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('color', colorName);
    setState(() {
      selectedColor = color;
    });
  }
}
