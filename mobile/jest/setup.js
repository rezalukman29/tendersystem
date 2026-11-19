/* eslint-env jest */
/* Native modules have no implementation under Jest; stub the ones Kru uses. */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () => require('@react-native-community/netinfo/jest/netinfo-mock.js'));
jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    Camera: ({codeScanner}) =>
      React.createElement(View, {
        testID: 'scanner-camera',
        onCodeScanned: codeScanner.onCodeScanned,
      }),
    useCameraDevice: () => ({id: 'back-camera', position: 'back'}),
    useCameraPermission: () => ({hasPermission: true, requestPermission: jest.fn(async () => true)}),
    useCodeScanner: config => config,
  };
});
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(async () => ({didCancel: true})),
  launchImageLibrary: jest.fn(async () => ({didCancel: true})),
}));
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'https://booqable-staging.emi.web.id',
  API_TIMEOUT_MS: '30000',
}));
