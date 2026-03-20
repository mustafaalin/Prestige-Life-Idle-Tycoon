const DEVICE_ID_KEY = 'idle_guy_device_id';
const PLAYER_NAME_KEY = 'idle_guy_player_name';

function generateUUID(): string {
  return crypto.randomUUID();
}

export interface DeviceIdentity {
  deviceId: string;
  playerName: string;
}

export const deviceIdentity = {
  initialize(): DeviceIdentity {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    let playerName = localStorage.getItem(PLAYER_NAME_KEY);
    if (!playerName) {
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      playerName = `player${randomNum}`;
      localStorage.setItem(PLAYER_NAME_KEY, playerName);
    }

    return {
      deviceId,
      playerName,
    };
  },

  getDeviceId(): string | null {
    return localStorage.getItem(DEVICE_ID_KEY);
  },

  async getProfileId(): Promise<string | null> {
    return localStorage.getItem(DEVICE_ID_KEY);
  },

  getPlayerName(): string {
    return localStorage.getItem(PLAYER_NAME_KEY) || 'player1000';
  },

  setPlayerName(name: string): void {
    localStorage.setItem(PLAYER_NAME_KEY, name);
  },

  reset(): void {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
  },
};
