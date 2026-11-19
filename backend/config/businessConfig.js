// Centralized business rules used by backend order and payment workflows.
const businessConfig = {
  timezone: 'Asia/Kolkata',
  orderLimits: {
    maxItems: 50,
    maxQuantityPerItem: 15,
  },
  temporaryOnlineOrderExpiryHours: 48,
};

export default businessConfig;
