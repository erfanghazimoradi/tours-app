const { APIFeatures } = require('../utils/apiFeatures');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const getAll = Model =>
  catchAsync(async (request, response) => {
    // handle review on tourID
    const { id: tourID } = request.params;

    const queryFilter = !!tourID ? { tour: tourID } : {};

    const docsTotal = new APIFeatures(Model.find(queryFilter), request.query).filter();

    const documentsFeatures = new APIFeatures(Model.find(queryFilter), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // use .explain() for query stats for indexes
    const documents = await documentsFeatures.query;
    const total = await docsTotal.query;

    const { page = 1, limit = 100 } = request.query;
    const totalPages = Math.ceil(total.length / Number(limit));

    response.status(200).json({
      status: 'success',
      total: total.length,
      page: Number(page),
      total_pages: totalPages,
      per_page: Number(limit),
      data: { documents }
    });
  });

const getOne = (Model, populateOpt) =>
  catchAsync(async (request, response, next) => {
    const { id: documentID } = request.params;

    let query = Model.findById(documentID);

    if (!!populateOpt) query = query.populate(populateOpt);

    const document = await query;

    if (!document)
      return next(new AppError(404, `No document found with that ID: ${documentID}`));

    response.status(200).json({
      status: 'success',
      data: { document }
    });
  });

const createOne = Model =>
  catchAsync(async (request, response) => {
    const newDocument = request.body;

    const document = await Model.create(newDocument);

    response.status(201).json({
      status: 'success',
      data: { document }
    });
  });

const updateOne = Model =>
  catchAsync(async (request, response, next) => {
    const { id: documentID } = request.params;
    const documentPatch = request.body;

    const document = await Model.findByIdAndUpdate(documentID, documentPatch, {
      new: true,
      runValidators: true
    });

    if (!document)
      return next(new AppError(404, `No documnet found with that ID: ${documentID}`));

    response.status(200).json({
      status: 'success',
      data: { document }
    });
  });

const deleteOne = Model =>
  catchAsync(async (request, response, next) => {
    const { id: documentID } = request.params;

    const document = await Model.findByIdAndDelete(documentID);

    if (!document)
      return next(new AppError(404, `No document found with that ID: ${documentID}`));

    response.status(204).json({
      status: 'success',
      data: null
    });
  });

module.exports = { getAll, getOne, createOne, updateOne, deleteOne };
