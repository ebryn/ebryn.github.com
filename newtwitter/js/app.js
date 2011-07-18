var NewTwitter = SC.Application.create();

NewTwitter.Tweet = SC.Object.extend({
  body: null,
  screenName: null,
  name: null,
  time: null,
  profileImage: null,

  humanTime: function() {
    return jQuery.timeago(new Date(this.get('time')));
  }.property('time')
});

NewTwitter.timelineController = SC.ArrayProxy.create({
  content: [],

  loadTweets: function(tweets) {
    this.set('content', []);
    var self = this;
    tweets.forEach(function(data) {
      var tweet = NewTwitter.Tweet.create({
        body: data.text, screenName: data.user.screen_name, name: data.user.name,
        time: data.created_at, profileImage: data.user.profile_image_url
      });
      self.pushObject(tweet);
    });
  }
});

NewTwitter.userController = SC.Object.create({
  followersCount: null,
  followingCount: null,
  tweetCount: null,
  friends: [],
  followers: [],

  loadUser: function(data) {
    this.set('followersCount', data.followers_count);
    this.set('followingCount', data.friends_count);
    this.set('tweetCount', data.statuses_count);
  },

  loadFriends: function(data) {
    this.set('friends', []);
    var self = this;
    jQuery.getJSON("http://api.twitter.com/1/users/lookup.json?callback=?", {user_id: data.slice(0, 5).join(',')}, function(friends_data) {
      friends_data.forEach(function(friend) {
        self.get('friends').pushObject(SC.Object.create({image: friend.profile_image_url}));
      });
    });
  },

  loadFollowers: function(data) {
    this.set('followers', []);
    var self = this;
    jQuery.getJSON("http://api.twitter.com/1/users/lookup.json?callback=?", {user_id: data.slice(0, 5).join(',')}, function(friends_data) {
      friends_data.forEach(function(friend) {
        self.get('followers').pushObject(SC.Object.create({image: friend.profile_image_url}));
      });
    });

  }
});

NewTwitter.LastTweetView = SC.View.extend({
  contentBinding: 'NewTwitter.timelineController.firstObject',
  countBinding: 'NewTwitter.userController.tweetCount',
  truncatedBody: function() {
    var content = this.get('content');
    if (!content) { return; }
    return content.get('body').substring(0, 35).trim() + '...';
  }.property('content')
});

NewTwitter.FollowingView = SC.View.extend({
  countBinding: 'NewTwitter.userController.followingCount'
});

NewTwitter.FollowersView = SC.View.extend({
  countBinding: 'NewTwitter.userController.followersCount'
});
