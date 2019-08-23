/* eslint-disable class-methods-use-this */
import { Op } from 'sequelize';
import db from '../database/models';

const {
  CommentThread,
  CommentThreadLike,
  User
} = db;

/**
 * @class CommentLikesController
 */
class CommentThreadLikesController {
  /**
   * @description Create a like for a comment
   *
   * @param {Object} req - HTTP Request
   * @param {Object} res - HTTP Response
   * @param {*} next - Next function
   *
   * @return {Object} Returned object
   */
  static likeReply(req, res, next) {
    const { id } = req.params;
    const { userId } = req.decoded;
    CommentThread.findOne({
      where: {
        id: {
          [Op.eq]: id,
        }
      }
    }).then((commentThread) => {
      if (!commentThread) {
        return res.status(404).json({
          message: 'Reply does not exist'
        });
      }


      CommentThreadLike.findOrCreate({
        where: {
          commentThreadId: {
            [Op.eq]: commentThread.id
          },
          userId: {
            [Op.eq]: userId
          }
        },
        defaults: { userId, commentThreadId: commentThread.id }
      }).then(([found, created]) => { // eslint-disable-line
        if (!created) {
          return res.status(400).json({
            message: 'Reply already liked'
          });
        }

        return res.status(200).json({
          commentThreadId: commentThread.id,
          message: 'Successfully liked'
        });
      }).catch(next);
    }).catch(next);
  }

  /**
   * @description Delete a like for a comment
   *
   * @param {Object} req - HTTP Request
   * @param {Object} res - HTTP Response
   * @param {*} next - Next function
   *
   * @return {Object} Returned object
   */
  static unLikeReply(req, res, next) {
    const { id } = req.params;
    const { userId } = req.decoded;
    CommentThread.findOne({
      where: {
        id: {
          [Op.eq]: id,
        }
      }
    }).then((commentThread) => {
      if (!commentThread) {
        return res.status(404).json({
          message: 'Reply does not exist'
        });
      }


      CommentThreadLike.findOne({
        where: {
          commentThreadId: {
            [Op.eq]: commentThread.id
          },
          userId: {
            [Op.eq]: userId
          }
        }
      }).then((commentThreadLike) => {
        if (!commentThreadLike) {
          return res.status(400).json({
            message: 'Reply has not been liked'
          });
        }

        commentThreadLike.destroy()
          .then(() => res.status(200).json({
            commentThreadId: commentThread.id,
            message: 'Successfully unliked'
          })).catch(next);
      }).catch(next);
    }).catch(next);
  }

  /**
   * @description Get all likes for a comment
   *
   * @param {Object} req - HTTP Request
   * @param {Object} res - HTTP Response
   * @param {*} next - Next function
   *
   * @return {Object} Returned object
   */
  static getLikes(req, res, next) {
    const page = parseInt((req.query.page), 10);
    const limit = parseInt((req.query.limit), 10);
    const offset = parseInt((page - 1), 10) * limit;

    const { id } = req.params;
    CommentThread.findOne({
      where: {
        id: {
          [Op.eq]: id,
        }
      }
    }).then((commentThread) => {
      if (!commentThread) {
        return res.status(404).json({
          message: 'Reply does not exist'
        });
      }


      CommentThreadLike.findAndCountAll({
        where: {
          commentThreadId: {
            [Op.eq]: commentThread.id
          }
        },
        include: [{ model: User, as: 'user', attributes: ['username'] }],
        attributes: { exclude: ['id', 'userId', 'commentThreadId', 'createdAt', 'updatedAt'] },
        offset,
        limit
      }).then((likes) => {
        const { count } = likes;
        const pageCount = Math.ceil(count / limit);

        return res.status(200).json({
          paginationMeta: {
            currentPage: page,
            pageSize: limit,
            totalCount: count,
            resultCount: likes.rows.length,
            pageCount,
          },
          likes: likes.rows,
          replyId: commentThread.id,
          likesCount: count,
        });
      }).catch(next);
    }).catch(next);
  }
}

export default CommentThreadLikesController;
