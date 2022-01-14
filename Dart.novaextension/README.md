![](https://lh3.googleusercontent.com/I8e7FwydNEwn3QW0BBq2Na8rSPTh_fA_Jli-S71GQWfToQj-v5UjUYGEFpqixGv4HnGjNulAawRkLQRwazvJKfyUJW6-GDK081o3IVTrkO3jDy9OmsRcNPlXzGCC7-mEqh5ttgt7uLhMfyxmfjiXNkvOCgMCVejQ5hk6RrA479889kQ0-2ud95c2Olwm7ajRrB80eErK2W4ckZfvDEro3di0WKS5SLQWkA_znkxkMZbbRV5oxF4mToIQVLqLocrZmSVYbiZv0l8jLOvnkAx4bbdtdNFSUJ0NGSe4UDYF7fTs2rR5D62iP61zVAHRGq_0k_k3X5FV1WOn730hOXWitPUw8rsxqCsmCKairc7bYzSc8dPi5OWUEH096YSv6ajKlDtmgKPuTByDnBHvVnbS8Jym6aOv0epXyEnut8dmgHJIA5CKcMjUmocSGHfMsV5X37uQrUJfgI8JX4n_zojtqDg86KDLBqzaYyris1BHux4CGg9lVQO_cg0JNaaa90jSHd8xeSqysqb3qu2ENBkijRPaiOvNtL7rmMWo9kcy84I_Z58ixwH0hb-WHCBTp99ogVv5VAP14fM1CnAP0HxWQ7B1zN9EJKaua7wnL-YyNzgosd0bEkpssCxBBc5Bkhi_wnrkoCikp-iIerr7_t2a4weaQQyFLKgr3GvHsYw4ULuuauzXESMHblQTTs9SQIvMYExKVUqewGiqmSjCInfqGKg=w1200-h260-no?authuser=0)

Advanced [Dart](https://dart.dev), [Flutter](https://flutter.dev) and [AngularDart](https://angualardart.dev) tools for [Nova](https://nova.app).

Supports syntax highlighting, intelligent code completion, auto formatting, the Nova Color Assistant, commands, sidebar and clips.

<br />

![](https://lh3.googleusercontent.com/P91Kf5Nv9Ym7-8uGcMsU9kS4zOjZ5DKHeZhGVf42FfmCWrMU8tJzQooa9xyjaf8zIX0b5JTHny9N3tn4OOxvdu231TB6Ghv6oHQ50Jlk4pAeNukyLJCxAxz-I8GpfPzJtqXMHqvwQIYWAY4WFvPILTi8nHaWvhQZHm8aQGoxVs4ZZD_3O9qKku49Z6wu-4RIA7Be-3HzHAxt2BnsvnKN_WbsJwGSsliEAu79OxxOw-sc8cWsHeJ6W8nHMVvC8jVTMfiUle2x01fvikkUHi9WwxCfljGDcHYqQjKDX3ruJgGrXAA6hFOEbf4bwQFdxOi3ecVlMDU7kr5fF01C-zM4b51Vcf5cLUQv97y-OPjY2iIYDHSjgYIZRFgvhYnwm6CQLYbXFgYQpEINT7IwlmmH0Vo79zpFjKP5LDyy1KVXhzLm92vRtTwOLtRUomKcaYPTOA2gFMifwPGpLle_KzUKWXikCYb-vfTSRXCEMANBcMd9dFVki2pvwFt6jUUylhdlWygmVJk0efN32X6VSSiLKLU3yAhZuvn13_F3XDwQafFlhpGUljFP5Qjvuhsm4FZu3quipqrP-WaryhUPKR_o8xAODzL5rinP5bpfBrUdxNvXFgCDTcdi350_Io7K2x9r-5ueFjl5dPrAyxmpM1zYjxiqQ_AT_iVFeDApLNK5RvbkSpF16ABYprgE5puW4FwAPan366jenAxaNcRNtwTAsHI=w1200-h721-no?authuser=0)

### Installation

To use this extension you will need to have the [Flutter SDK](https://flutter.dev/docs/get-started/install/macos) or the [Dart SDK](https://dart.dev/get-dart) installed on your system.

To use the built in language server, specify the location of the Dart Language Server in the extension preferences. If you have installed the Flutter SDK in your home directory then the extension should connect automatically, otherwise specify the full path to the language server executable (`analysis_server.dart.snapshot`), which if using Flutter will be `<path to Flutter SDK>/flutter/bin/cache/dart-sdk/bin/snapshots`, or if using the Dart SDK the path will be `<path to Dart SDK>/dart-sdk/bin/snapshots`.

### Caveats

The extension cannot currently find the dart LSP executable when installed by Homebrew. If you installed Flutter with Homebrew then use one of the following paths in the preferences:

```shell
# for M1 mac
/opt/homebrew/Caskroom/flutter/2.8.0/flutter/bin/cache/dart-sdk/bin/snapshots
# for Intell mac
/usr/local/Caskroom/flutter/2.8.0/flutter/bin/cache/dart-sdk/bin/snapshots
```

The extension is not finished and some planned features are not implemented, there are some UI elements and commands that available that will not work. This includes Hot Reloading - which is essential to this extension leaving beta. Please see these embelishment to the UI as a roadmap to the future of this extension. If you find something that dosen't work please feel free to [open an issue](https://github.com/sciencefidelity/Nova-Dart/issues).

### Credits

The syntax of Dart was modified from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Much of the code for the LSP was copied from [TypeScript](https://github.com/apexskier/nova-typescript) by Cameron Little. Clips are borrowed from [Dart Code](https://github.com/Dart-Code/Dart-Code) by Danny Tuppeny. Many thanks to the creators of those extensions!

Dart and the related logo are trademarks of Google LLC. Flutter and the related logo are trademarks of Google LLC. We are not endorsed by or affiliated with Google LLC.

<br />
