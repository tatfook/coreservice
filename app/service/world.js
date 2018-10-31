const _ = require('lodash');
const base32 = require('base32');
const uuid = require('uuid/v1');
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
    let curUUID = uuid();
    let curStatus = { [curUUID]: { status: false, createTime: Date.now() + 15 * 1000 } };

    this.app.git.createStatus.push(curStatus);

    if (!userInfo || !userInfo.username) {
      console.log('未认证');
      return false;
    }

    let baseWorldName = this.base32(worldName);

    let { gitlabToken, gitlabUsername } = await this.app.gitGateway.getUserGitlabTokenAndUsername(token);

    if (!gitlabToken) {
      console.log('未找gitlab token');
      return false;
    }

    let result = await this.app.git.isProjectExist(gitlabToken, gitlabUsername, baseWorldName);

    if (!result) {
      let result = await this.app.gitGateway.createProject(userInfo.username, baseWorldName);

      if (!result) {
        console.log('创建GIT项目失败', result);
        return false;
      }
    }

    let tree = await this.app.gitGateway.getTree();

    await new Promise((resolve, reject) => {
      let index = 0;

      if (!tree || tree.length == 0) {
        resolve();
      }

      _.forEach(tree, async (item, key) => {
        if (item && item.path) {
          let content = await this.app.gitGateway.getContent(null, item.path);

          item.content = content;
          index++;

          if (index == tree.length) {
            resolve();
          }
        }
      });
    });

    new Promise((resolve, reject) => {
      let index = 0;
      let self = this;

      async function upload() {
        if (index == tree.length) {
          resolve(true);

          if (curStatus[curUUID]) {
            console.log('sync files finish!');
            curStatus[curUUID].status = true;
          }

          return true;
        }

        let item = tree[index];
        if (item && item.path && item.content) {
          if (item.path == 'tag.xml') {
            item.content = item.content.replace('name="DefaultName"', `name="${worldName || ''}"`);
          }

          await self.app.git.writeFile(gitlabToken, gitlabUsername, baseWorldName, item.path, item.content);

          index++;
          upload();
        } else {
          reject(false);
        }
      }

      upload();
    });

    const archiveUrl = this.getArchiveUrl(userInfo.username, worldName);
    return { statusUUID: curUUID, archiveUrl };
  }

  getCreateWorldStatus(uuid) {
    let status = this.app.git.getCreateStatus(uuid);

    return { status };
  }

  async removeProject(worldName) {
    let userInfo = this.ctx.state.user;
    let token = this.ctx.state.token;
    if (!userInfo || !userInfo.username) {
      console.log('未认证');
      return false;
    }

    let baseWorldName = this.base32(worldName);
    let projectPath = `${userInfo.username || ''}/${baseWorldName}`;

    try {
      let result = await this.app.gitGateway.removeProject(projectPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  // =转成-equal  +转成-plus  /转成-slash
  base32(text) {
    if (text) {
      let notLetter = text.match(/[^a-zA-Z0-9]/g);

      if (notLetter) {
        text = base32.encode(text);

        text = text.replace(/[=]/g, '-equal');
        text = text.replace(/[+]/g, '-plus');
        text = text.replace(/[/]/g, '-slash');

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

        text = text.replace(/-equal/g, '=');
        text = text.replace(/-plus/g, '+');
        text = text.replace(/-slash/g, '/');

        return Encoding.from_base32(text);
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
