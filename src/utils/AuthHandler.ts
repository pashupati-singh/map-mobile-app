type LogoutCallback = () => void;

let logoutCallback: LogoutCallback | null = null;

export const AuthHandler = {
  setLogoutCallback(callback: LogoutCallback) {
    logoutCallback = callback;
  },

  triggerLogout() {
    if (logoutCallback) {
      logoutCallback();
    }
  },
};

