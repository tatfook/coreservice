const _ = require('lodash');
const base32 = require('hi-base32');
const Service = require('egg').Service;

class World extends Service {
  getArchiveUrl(username, worldName) {
    const config = this.app.config.self.gitlab;
    const host = config.host;
    const baseWorldName = this.base32(worldName);
    const gitUsername = config.usernamePrefix + username;

    return `${host}/${gitUsername}/${baseWorldName}/repository/archive.zip`;
  }

  async generateDefaultWorld(worldName) {
    let userInfo = this.ctx.state.user;
    let token = this.ctx.state.token;
    if (!userInfo || !userInfo.username) {
      console.log('未认证');
      return false;
    }

    let baseWorldName = this.base32(worldName);

    let {
      gitlabToken,
      gitlabUsername
    } = await this.app.gitGateway.getUserGitlabTokenAndUsername(token);

    if (!gitlabToken) {
      console.log('未找gitlab token');
      return false;
    }

    let result = await this.app.git.isProjectExist(
      gitlabToken,
      gitlabUsername,
      baseWorldName
    );

    if (!result) {
      let result = await this.app.git.createProject(
        gitlabToken,
        baseWorldName
      );

      if (result) {
        return true
      } else {
        console.log('创建GIT项目失败', result);
        return false;
      }
    }
  }

  async removeProject(worldName) {
    let userInfo = this.ctx.state.user;
    let token = this.ctx.state.token;
    if (!userInfo || !userInfo.username) {
      console.log('未认证');
      return false;
    }

    let {
      gitlabToken,
      gitlabUsername
    } = await this.app.gitGateway.getUserGitlabTokenAndUsername(token);

    if (!gitlabToken) {
      console.log('未找gitlab token');
      return false;
    }

    let baseWorldName = this.base32(worldName);

    try {
      let result = await this.app.git.removeProject(gitlabToken, gitlabUsername, baseWorldName)
	  return true;
    } catch (error) {
      return false
    }
  }

  base32(text) {
    if (text) {
      let notLetter = text.match(/[^a-zA-Z]/g);

      if (notLetter) {
        text = base32.encode(text);

        text = text.replace(/[=]/g, '');
        text = text.toLocaleLowerCase();

        text = 'world_base32_' + text;
      } else {
        text = 'world_' + text;
      }

      return text;
    } else {
      return nil;
    }
  }

  unbase32(text) {
    if (text) {
      let notLetter = text.match('world_base32_');

      if (notLetter) {
        text = text.replace('world_base32_', '');

        return Encoding.decode(text);
      } else {
        text = text.replace('world_', '');

        return text;
      }
    } else {
      return nil;
    }
  }
}

module.exports = World;
