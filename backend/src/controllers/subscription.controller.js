import {
  subscribe,
  unsubscribe,
  getSubscriberCount,
  isSubscribed
} from '../services/subscription.service.js';

export const getSubscriptionStatus = async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const count = await getSubscriberCount(channelId);
    const subscribed = await isSubscribed(req.user.id, channelId);

    res.json({ count, subscribed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleSubscription = async (req, res) => {
  try {
    const subscriberId = req.user.id;
    const channelId = req.params.channelId;
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