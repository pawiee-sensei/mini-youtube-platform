import {
  subscribe,
  unsubscribe,
  getSubscriberCount,
  isSubscribed
} from '../services/subscription.service.js';

const getSubscriptionSummary = async (subscriberId, channelId) => {
  const [count, subscribed] = await Promise.all([
    getSubscriberCount(channelId),
    isSubscribed(subscriberId, channelId)
  ]);

  return { count, subscribed };
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { id: subscriberId } = req.user;
    const { count, subscribed } = await getSubscriptionSummary(subscriberId, channelId);

    res.json({ count, subscribed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleSubscription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { id: subscriberId } = req.user;
    const subscribed = await isSubscribed(subscriberId, channelId);

    if (subscribed) {
      await unsubscribe(subscriberId, channelId);
    } else {
      await subscribe(subscriberId, channelId);
    }

    const count = await getSubscriberCount(channelId);

    res.json({
      count,
      subscribed: !subscribed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
