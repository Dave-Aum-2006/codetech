import Chat from '../models/Chat.js';
import User from '../models/User.js';

// @desc    Create or retrieve 1-to-1 chat
// @route   POST /api/chat
// @access  Private
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log('userId param not sent with request');
    return res.sendStatus(400);
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'username avatar email status',
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
export const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'username avatar email status',
    });

    res.status(200).send(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new Group Chat
// @route   POST /api/chat/group
// @access  Private
export const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please fill in all fields' });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: 'More than 2 users are required to form a group chat' });
  }

  // Add current logged-in user to the group
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename Group Chat
// @route   PUT /api/chat/rename
// @access  Private
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      res.status(404).json({ message: 'Chat Not Found' });
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add member to group chat
// @route   PUT /api/chat/groupadd
// @access  Private
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!added) {
      res.status(404).json({ message: 'Chat Not Found' });
    } else {
      res.json(added);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove member from group chat / leave group
// @route   PUT /api/chat/groupremove
// @access  Private
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!removed) {
      res.status(404).json({ message: 'Chat Not Found' });
    } else {
      res.json(removed);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
