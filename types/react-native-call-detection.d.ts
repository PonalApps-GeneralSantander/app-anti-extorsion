declare module 'react-native-call-detection' {
  export interface CallDetectorManagerOptions {
    title?: string;
    message?: string;
  }

  export type CallState = 
    | 'Connected'
    | 'Disconnected'
    | 'Dialing'
    | 'Incoming'
    | 'Offhook'
    | 'Missed';

  export type CallDetectorCallback = (
    event: CallState,
    phoneNumber?: string
  ) => void;

  export default class CallDetectorManager {
    constructor(
      callback: CallDetectorCallback,
      readPhoneNumber?: boolean,
      permissionDeniedCallback?: () => void,
      permissionRequestOptions?: CallDetectorManagerOptions
    );
    
    dispose(): void;
  }
} 