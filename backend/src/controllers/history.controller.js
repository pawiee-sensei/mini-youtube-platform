import { getWatchHistoryByUser, upsertWatchHistory } from '../services/history.service.js';

export const saveWatchHistory = async (req, res) => {
  try {
    const progressSeconds = Number(req.body.progressSeconds);
    const durationSeconds = Number(req.body.durationSeconds);

    await upsertWatchHistory({
      userId: req.user.id,
      videoId: Number(req.params.videoId),
      progressSeconds,
      durationSeconds
    });

    res.json({ message: 'History saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchWatchHistory = async (req, res) => {
  try {
    if (Number(req.params.userId) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const history = await getWatchHistoryByUser(Number(req.params.userId));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
