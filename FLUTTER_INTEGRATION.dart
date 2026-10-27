// ============================================================================
// FLUTTER INTEGRATION GUIDE - Digital Tasbeeh Counter
// ============================================================================
// 
// This web app is designed to work seamlessly inside a Flutter WebView.
// Below are integration examples for popular Flutter WebView packages.
//
// ============================================================================
// OPTION 1: webview_flutter (Official Flutter Plugin)
// ============================================================================
//
// Add to pubspec.yaml:
//   dependencies:
//     webview_flutter: ^4.4.2
//
// Flutter code:
//
// import 'dart:convert';
// import 'package:flutter/material.dart';
// import 'package:webview_flutter/webview_flutter.dart';
//
// class TasbeehWebView extends StatefulWidget {
//   const TasbeehWebView({super.key});
//   @override
//   State<TasbeehWebView> createState() => _TasbeehWebViewState();
// }
//
// class _TasbeehWebViewState extends State<TasbeehWebView> {
//   late final WebViewController controller;
//   int _count = 0;
//   int _totalLaps = 0;
//
//   @override
//   void initState() {
//     super.initState();
//     controller = WebViewController()
//       ..setJavaScriptMode(JavaScriptMode.unrestricted)
//       ..setBackgroundColor(const Color(0xFF00160D))
//       ..setNavigationDelegate(NavigationDelegate(
//         onPageFinished: (url) {
//           // Enable haptic feedback from Flutter side
//           controller.runJavaScript('''
//             window.FlutterWebView = {
//               postMessage: function(msg) {
//                 var data = JSON.parse(msg);
//                 // Handle messages from the web app
//                 if (data.type === 'haptic') {
//                   // Trigger native Flutter haptic
//                   HapticFeedback.lightImpact();
//                 }
//               }
//             };
//           ''');
//         },
//       ))
//       ..addJavaScriptChannel(
//         'FlutterWebView',
//         onMessageReceived: (JavaScriptMessage message) {
//           final data = jsonDecode(message.message);
//           switch (data['type']) {
//             case 'count':
//               setState(() => _count = data['data']['count']);
//               break;
//             case 'lapComplete':
//               setState(() => _totalLaps++);
//               HapticFeedback.heavyImpact();
//               break;
//             case 'themeChanged':
//               // Update Flutter app theme if needed
//               break;
//             case 'haptic':
//               if (data['data']['type'] == 'heavy') {
//                 HapticFeedback.heavyImpact();
//               } else {
//                 HapticFeedback.lightImpact();
//               }
//               break;
//           }
//         },
//       )
//       ..loadFlutterAsset('assets/tasbeeh/index.html');
//       // OR load from URL:
//       // ..loadRequest(Uri.parse('https://your-tasbeeh-app.com'));
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Tasbeeh Counter'),
//         backgroundColor: const Color(0xFF00160D),
//         foregroundColor: const Color(0xFFD4AF37),
//       ),
//       body: WebViewWidget(controller: controller),
//       // Optional: Native Flutter controls alongside WebView
//       bottomNavigationBar: BottomAppBar(
//         child: Row(
//           mainAxisAlignment: MainAxisAlignment.spaceAround,
//           children: [
//             Text('Count: $_count'),
//             Text('Laps: $_totalLaps'),
//             IconButton(
//               icon: const Icon(Icons.refresh),
//               onPressed: () {
//                 controller.runJavaScript('localStorage.clear(); location.reload();');
//               },
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
//
// ============================================================================
// OPTION 2: flutter_inappwebview (Advanced Features)
// ============================================================================
//
// Add to pubspec.yaml:
//   dependencies:
//     flutter_inappwebview: ^6.0.0
//
// Flutter code:
//
// import 'package:flutter_inappwebview/flutter_inappwebview.dart';
//
// class TasbeehInAppWebView extends StatefulWidget {
//   const TasbeehInAppWebView({super.key});
//   @override
//   State<TasbeehInAppWebView> createState() => _TasbeehInAppWebViewState();
// }
//
// class _TasbeehInAppWebViewState extends State<TasbeehInAppWebView> {
//   InAppWebViewController? webViewController;
//
//   @override
//   Widget build(BuildContext context) {
//     return InAppWebView(
//       initialUrlRequest: URLRequest(
//         url: WebUri('https://your-tasbeeh-app.com'),
//       ),
//       initialSettings: InAppWebViewSettings(
//         javaScriptEnabled: true,
//         transparentBackground: true,
//         supportZoom: false,
//         useWideViewPort: true,
//         // Flutter WebView specific
//         allowsBackForwardNavigationGestures: false,
//         mediaPlaybackRequiresUserGesture: false,
//       ),
//       onWebViewCreated: (controller) {
//         webViewController = controller;
//         // Register handler for web app messages
//         controller.addJavaScriptHandler(
//           handlerName: 'TasbeehEvent',
//           callback: (args) {
//             if (args.isNotEmpty) {
//               final data = jsonDecode(args[0] as String);
//               // Handle events from web app
//               switch (data['type']) {
//                 case 'haptic':
//                   HapticFeedback.lightImpact();
//                   break;
//                 case 'lapComplete':
//                   HapticFeedback.heavyImpact();
//                   break;
//                 case 'count':
//                   print('Count: ${data['data']['count']}');
//                   break;
//               }
//             }
//           },
//         );
//       },
//       onLoadStop: (controller, url) async {
//         // Send theme preference from Flutter to web app
//         final isDark = Theme.of(context).brightness == Brightness.dark;
//         await controller.evaluateJavascript(source: '''
//           window.postMessage({
//             channel: "flutter-tasbeeh",
//             action: "setTheme",
//             payload: "${isDark ? 'dark' : 'light'}"
//           }, "*");
//         ''');
//       },
//     );
//   }
// }
//
// ============================================================================
// OPTION 3: Simple WebView with Native Haptics
// ============================================================================
//
// For a simpler integration where Flutter handles haptics natively:
//
// class SimpleTasbeehScreen extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: WebViewWidget(
//         controller: WebViewController()
//           ..setJavaScriptMode(JavaScriptMode.unrestricted)
//           ..setBackgroundColor(const Color(0xFF00160D))
//           ..loadFlutterAsset('assets/tasbeeh/index.html'),
//       ),
//     );
//   }
// }
//
// ============================================================================
// JAVASCRIPT BRIDGE API
// ============================================================================
//
// The web app sends these messages to Flutter:
//
// { "type": "appReady", "data": {...} }           - App loaded
// { "type": "count", "data": { "count": N } }     - Count changed
// { "type": "lapComplete", "data": {...} }        - Target reached
// { "type": "themeChanged", "data": { "theme": "dark"|"light" } }
// { "type": "haptic", "data": { "type": "light"|"heavy", "duration": N } }
// { "type": "reset", "data": {} }                 - Counter reset
// { "type": "targetChanged", "data": { "target": N } }
//
// Flutter can send these messages to the web app:
//
// { "channel": "flutter-tasbeeh", "action": "setTheme", "payload": "dark"|"light" }
// { "channel": "flutter-tasbeeh", "action": "reset", "payload": null }
// { "channel": "flutter-tasbeeh", "action": "getState", "payload": null }
//
// ============================================================================
// BUILD FOR FLUTTER
// ============================================================================
//
// 1. Build the web app: npm run build
// 2. Copy the 'dist/' folder to your Flutter project:
//    flutter_project/assets/tasbeeh/
// 3. Add to pubspec.yaml:
//    flutter:
//      assets:
//        - assets/tasbeeh/
//        - assets/tasbeeh/assets/
// 4. Load with: controller.loadFlutterAsset('assets/tasbeeh/index.html')
//
// ============================================================================
