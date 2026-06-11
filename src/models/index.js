const { sequelize } = require("../config/database");
const { User, initializeUser } = require("./User");
const { Post, initializePost } = require("./Post");
const { Media, initializeMedia } = require("./Media");
const { Comment, initializeComment } = require("./Comment");
const { Rating, initializeRating } = require("./Rating");
const { Report, initializeReport } = require("./Report");
const { Follow, initializeFollow } = require("./Follow");
const { Notification, initializeNotification } = require("./Notification");
const { Interest, initializeInterest } = require("./Interest");
const { Collection, initializeCollection } = require("./Collection");
const { CollectionItem, initializeCollectionItem } = require("./CollectionItem");
const { Tag, initializeTag } = require("./Tag");
const { PostTag, initializePostTag } = require("./PostTag");
const { NotificationComment, initializeNotificationComment } = require("./NotificationComment");
const { NotificationRating, initializeNotificationRating } = require("./NotificationRating");
const { NotificationFollow, initializeNotificationFollow } = require("./NotificationFollow");
const { NotificationInterest, initializeNotificationInterest } = require("./NotificationInterest");
const { NotificationReport, initializeNotificationReport } = require("./NotificationReport");
const { Message, initializeMessage } = require("./Message");

const initializeModels = () => {
    if (!User.sequelize) {
        initializeUser(sequelize);
    }

    if (!Post.sequelize) {
        initializePost(sequelize);
    }

    if (!Media.sequelize) {
        initializeMedia(sequelize);
    }

    if (!Comment.sequelize) {
        initializeComment(sequelize);
    }

    if (!Rating.sequelize) {
        initializeRating(sequelize);
    }

    if (!Report.sequelize) {
        initializeReport(sequelize);
    }

    if (!Follow.sequelize) {
        initializeFollow(sequelize);
    }

    if (!Notification.sequelize) {
        initializeNotification(sequelize);
    }

    if (!Interest.sequelize) {
        initializeInterest(sequelize);
    }

    if (!Collection.sequelize) {
        initializeCollection(sequelize);
    }

    if (!CollectionItem.sequelize) {
        initializeCollectionItem(sequelize);
    }

    if (!Tag.sequelize) {
        initializeTag(sequelize);
    }

    if (!PostTag.sequelize) {
        initializePostTag(sequelize);
    }

    if (!NotificationComment.sequelize) {
        initializeNotificationComment(sequelize);
    }

    if (!NotificationRating.sequelize) {
        initializeNotificationRating(sequelize);
    }

    if (!NotificationFollow.sequelize) {
        initializeNotificationFollow(sequelize);
    }

    if (!NotificationInterest.sequelize) {
        initializeNotificationInterest(sequelize);
    }

    if (!NotificationReport.sequelize) {
        initializeNotificationReport(sequelize);
    }

    if (!Message.sequelize) {
        initializeMessage(sequelize);
    }

    User.hasMany(Post, {
        foreignKey: "user_id",
        as: "posts"
    });

    Post.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Post.hasMany(Media, {
        foreignKey: "post_id",
        as: "media"
    });

    Media.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    User.hasMany(Comment, {
        foreignKey: "user_id",
        as: "comments"
    });

    Comment.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Post.hasMany(Comment, {
        foreignKey: "post_id",
        as: "comments"
    });

    Comment.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    User.hasMany(Rating, {
        foreignKey: "user_id",
        as: "ratings"
    });

    Rating.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Post.hasMany(Rating, {
        foreignKey: "post_id",
        as: "ratings"
    });

    Rating.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    User.hasMany(Report, {
        foreignKey: "reporter_id",
        as: "reportsMade"
    });

    Report.belongsTo(User, {
        foreignKey: "reporter_id",
        as: "reporter"
    });

    User.hasMany(Report, {
        foreignKey: "reported_user_id",
        as: "reportsReceived"
    });

    Report.belongsTo(User, {
        foreignKey: "reported_user_id",
        as: "reportedUser"
    });

    Post.hasMany(Report, {
        foreignKey: "post_id",
        as: "reports"
    });

    Report.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    Comment.hasMany(Report, {
        foreignKey: "comment_id",
        as: "reports"
    });

    Report.belongsTo(Comment, {
        foreignKey: "comment_id",
        as: "comment"
    });

    User.hasMany(Follow, {
        foreignKey: "follower_id",
        as: "followingRelations"
    });

    Follow.belongsTo(User, {
        foreignKey: "follower_id",
        as: "follower"
    });

    User.hasMany(Follow, {
        foreignKey: "following_id",
        as: "followerRelations"
    });

    Follow.belongsTo(User, {
        foreignKey: "following_id",
        as: "following"
    });

    User.hasMany(Notification, {
        foreignKey: "user_id",
        as: "notifications"
    });

    Notification.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    User.hasMany(Notification, {
        foreignKey: "actor_id",
        as: "actionsGenerated"
    });

    Notification.belongsTo(User, {
        foreignKey: "actor_id",
        as: "actor"
    });

    User.hasMany(Interest, {
        foreignKey: "user_id",
        as: "interests"
    });

    Interest.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Post.hasMany(Interest, {
        foreignKey: "post_id",
        as: "interests"
    });

    Interest.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    User.hasMany(Collection, {
        foreignKey: "user_id",
        as: "collections"
    });

    Collection.belongsTo(User, {
        foreignKey: "user_id",
        as: "user"
    });

    Collection.hasMany(CollectionItem, {
        foreignKey: "collection_id",
        as: "items"
    });

    CollectionItem.belongsTo(Collection, {
        foreignKey: "collection_id",
        as: "collection"
    });

    Post.hasMany(CollectionItem, {
        foreignKey: "post_id",
        as: "collectionItems"
    });

    CollectionItem.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    Post.belongsToMany(Tag, {
        through: PostTag,
        foreignKey: "post_id",
        otherKey: "tag_id",
        as: "tags"
    });

    Tag.belongsToMany(Post, {
        through: PostTag,
        foreignKey: "tag_id",
        otherKey: "post_id",
        as: "posts"
    });

    Post.hasMany(PostTag, {
        foreignKey: "post_id",
        as: "postTags"
    });

    PostTag.belongsTo(Post, {
        foreignKey: "post_id",
        as: "post"
    });

    Tag.hasMany(PostTag, {
        foreignKey: "tag_id",
        as: "postTags"
    });

    PostTag.belongsTo(Tag, {
        foreignKey: "tag_id",
        as: "tag"
    });

    Notification.hasOne(NotificationComment, {
        foreignKey: "notification_id",
        as: "notificationComment"
    });

    NotificationComment.belongsTo(Notification, {
        foreignKey: "notification_id",
        as: "notification"
    });

    Comment.hasMany(NotificationComment, {
        foreignKey: "comment_id",
        as: "notificationComments"
    });

    NotificationComment.belongsTo(Comment, {
        foreignKey: "comment_id",
        as: "comment"
    });

    Notification.hasOne(NotificationRating, {
        foreignKey: "notification_id",
        as: "notificationRating"
    });

    NotificationRating.belongsTo(Notification, {
        foreignKey: "notification_id",
        as: "notification"
    });

    Rating.hasMany(NotificationRating, {
        foreignKey: "rating_id",
        as: "notificationRatings"
    });

    NotificationRating.belongsTo(Rating, {
        foreignKey: "rating_id",
        as: "rating"
    });

    Notification.hasOne(NotificationFollow, {
        foreignKey: "notification_id",
        as: "notificationFollow"
    });

    NotificationFollow.belongsTo(Notification, {
        foreignKey: "notification_id",
        as: "notification"
    });

    User.hasMany(NotificationFollow, {
        foreignKey: "follower_id",
        as: "notificationFollows"
    });

    NotificationFollow.belongsTo(User, {
        foreignKey: "follower_id",
        as: "follower"
    });

    Notification.hasOne(NotificationInterest, {
        foreignKey: "notification_id",
        as: "notificationInterest"
    });

    NotificationInterest.belongsTo(Notification, {
        foreignKey: "notification_id",
        as: "notification"
    });

    Interest.hasMany(NotificationInterest, {
        foreignKey: "interest_id",
        as: "notificationInterests"
    });

    NotificationInterest.belongsTo(Interest, {
        foreignKey: "interest_id",
        as: "interest"
    });

    Notification.hasOne(NotificationReport, {
        foreignKey: "notification_id",
        as: "notificationReport"
    });

    NotificationReport.belongsTo(Notification, {
        foreignKey: "notification_id",
        as: "notification"
    });

    Report.hasMany(NotificationReport, {
        foreignKey: "report_id",
        as: "notificationReports"
    });

    NotificationReport.belongsTo(Report, {
        foreignKey: "report_id",
        as: "report"
    });

    Interest.hasMany(Message, {
        foreignKey: "interest_id",
        as: "messages"
    });

    Message.belongsTo(Interest, {
        foreignKey: "interest_id",
        as: "interest"
    });

    User.hasMany(Message, {
        foreignKey: "sender_id",
        as: "messagesSent"
    });

    Message.belongsTo(User, {
        foreignKey: "sender_id",
        as: "sender"
    });

    return {
        sequelize,
        User,
        Post,
        Media,
        Comment,
        Rating,
        Report,
        Follow,
        Notification,
        Interest,
        Collection,
        CollectionItem,
        Tag,
        PostTag,
        NotificationComment,
        NotificationRating,
        NotificationFollow,
        NotificationInterest,
        NotificationReport,
        Message
    };
};

module.exports = initializeModels();
