const path = require('path');

const reactNativeConfigAndroidDir = path.join(
  __dirname,
  'node_modules/react-native-config/android',
);

module.exports = {
  dependencies: {
    'react-native-config': {
      platforms: {
        android: {
          sourceDir: reactNativeConfigAndroidDir,
          packageImportPath:
            'import com.lugg.RNCConfig.RNCConfigPackage;',
          packageInstance: 'new RNCConfigPackage()',
          buildTypes: [],
          libraryName: 'RNCConfigSpec',
          componentDescriptors: [],
          cmakeListsPath: path.join(
            reactNativeConfigAndroidDir,
            'build/generated/source/codegen/jni/CMakeLists.txt',
          ),
        },
      },
    },
  },
};
