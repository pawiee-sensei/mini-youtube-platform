import {
  subscribe,
  unsubscribe,
  getSubscriberCount,
  isSubscribed
} from '../services/subscription.service.js';
import { findUserById } from '../services/auth.service.js';

const getSubscriptionSummary = async (subscriberId, channelId) => {
  const [count, subscribed] = await Promise.all([
    getSubscriberCount(channelId),
    isSubscribed(subscriberId, channelId)
  ]);

  return { count, subscribed };
};

const getChannelOrFail = async (channelId, res) => {
  const channel = await findUserById(channelId);

  if (!channel) {
    res.status(404).json({ error: 'Channel not found' });
    return null;
  }

  return channel;
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { id: subscriberId } = req.user;

    const channel = await getChannelOrFail(channelId, res);
    if (!channel) return;

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

    if (Number(subscriberId) === Number(channelId)) {
      return res.status(400).json({ error: 'You cannot subscribe to your own channel' });
    }

    const channel = await getChannelOrFail(channelId, res);
    if (!channel) return;

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
