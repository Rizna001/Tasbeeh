// ============================================================================
// FLUTTER INTEGRATION GUIDE - Digital Tasbeeh Counter (Enhanced)
// ============================================================================
//
// This web app is designed to work seamlessly inside a Flutter WebView.
// 
// ============================================================================
// FEATURES
// ============================================================================
//
// ✅ Dark / Light / Sepia themes (persisted in localStorage)
// ✅ Font size preference (Small, Medium, Large, X-Large)
// ✅ Dhikr selection with 10 presets + Custom option
// ✅ Target presets: 33, 99, 100, 300, 500, 1000, 10000 + Custom
// ✅ 5 synthesized sounds (default: Silent)
// ✅ Lap tracking with history
// ✅ Mobile haptic vibration
// ✅ Full responsive design for all devices
// ✅ Flutter WebView compatible (3 bridge methods)
//
// ============================================================================
// JAVASCRIPT BRIDGE API
// ============================================================================
//
// MESSAGES FROM WEB → FLUTTER:
//
// { "type": "appReady", "data": { "theme": "dark", "fontSize": "medium" } }
// { "type": "count", "data": { "count": 15, "target": 33, "totalAllTime": 150 } }
// { "type": "lapComplete", "data": { "lap": 1, "target": 33 } }
// { "type": "themeChanged", "data": { "theme": "dark"|"light"|"sepia" } }
// { "type": "haptic", "data": { "type": "light"|"heavy", "duration": 30 } }
// { "type": "reset", "data": {} }
// { "type": "targetChanged", "data": { "target": 100 } }
//
// MESSAGES FROM FLUTTER → WEB:
//
// window.postMessage({
//   channel: "flutter-tasbeeh",
//   action: "setTheme",
//   payload: "dark" | "light" | "sepia"
// }, "*");
//
// window.postMessage({
//   channel: "flutter-tasbeeh",
//   action: "reset",
//   payload: null
// }, "*");
//
// ============================================================================
// FLUTTER CODE EXAMPLE (webview_flutter)
// ============================================================================
//
// import 'dart:convert';
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:webview_flutter/webview_flutter.dart';
//
// class TasbeehScreen extends StatefulWidget {
//   const TasbeehScreen({super.key});
//   @override
//   State<TasbeehScreen> createState() => _TasbeehScreenState();
// }
//
// class _TasbeehScreenState extends State<TasbeehScreen> {
//   late final WebViewController _controller;
//   int _count = 0;
//   int _totalLaps = 0;
//   ThemeMode _themeMode = ThemeMode.dark;
//
//   @override
//   void initState() {
//     super.initState();
//     
//     _controller = WebViewController()
//       ..setJavaScriptMode(JavaScriptMode.unrestricted)
//       ..setBackgroundColor(const Color(0xFF000D08))
//       ..addJavaScriptChannel(
//         'FlutterWebView',
//         onMessageReceived: (JavaScriptMessage message) {
//           final data = jsonDecode(message.message);
//           _handleFlutterMessage(data);
//         },
//       )
//       ..loadFlutterAsset('assets/tasbeeh/index.html');
//   }
//
//   void _handleFlutterMessage(Map<String, dynamic> data) {
//     switch (data['type']) {
//       case 'count':
//         setState(() => _count = data['data']['count']);
//         break;
//       case 'lapComplete':
//         setState(() => _totalLaps++);
//         HapticFeedback.heavyImpact();
//         break;
//       case 'haptic':
//         if (data['data']['type'] == 'heavy') {
//           HapticFeedback.heavyImpact();
//         } else {
//           HapticFeedback.lightImpact();
//         }
//         break;
//       case 'themeChanged':
//         final theme = data['data']['theme'];
//         setState(() {
//           _themeMode = theme == 'light' ? ThemeMode.light 
//                      : theme == 'sepia' ? ThemeMode.light 
//                      : ThemeMode.dark;
//         });
//         break;
//     }
//   }
//
//   void _sendToWeb(String action, dynamic payload) {
//     _controller.runJavaScript('''
//       window.postMessage({
//         channel: "flutter-tasbeeh",
//         action: "$action",
//         payload: ${payload == null ? 'null' : '"$payload"'}
//       }, "*");
//     ''');
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Theme(
//       data: ThemeData(brightness: _themeMode == ThemeMode.light 
//           ? Brightness.light : Brightness.dark),
//       child: Scaffold(
//         appBar: AppBar(
//           title: const Text('Tasbeeh Counter'),
//           actions: [
//             IconButton(
//               icon: const Icon(Icons.refresh),
//               onPressed: () => _sendToWeb('reset', null),
//             ),
//           ],
//         ),
//         body: WebViewWidget(controller: _controller),
//       ),
//     );
//   }
// }
//
// ============================================================================
// BUILD & DEPLOY FOR FLUTTER
// ============================================================================
//
// 1. Build the web app:
//    npm run build
//
// 2. Copy dist/ folder to Flutter project:
//    cp -r dist/* flutter_project/assets/tasbeeh/
//
// 3. Add to pubspec.yaml:
//    flutter:
//      assets:
//        - assets/tasbeeh/
//        - assets/tasbeeh/assets/
//
// 4. Load in WebView:
//    controller.loadFlutterAsset('assets/tasbeeh/index.html')
//
// ============================================================================
