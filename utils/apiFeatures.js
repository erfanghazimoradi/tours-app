class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryClone = { ...this.queryString };

    const excludeFileds = ['sort', 'fields', 'page', 'limit'];

    excludeFileds.forEach(item => delete queryClone[item]);

    let queryStr = JSON.stringify(queryClone);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (!!this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('-createdAt');

    return this;
  }

  limitFields() {
    if (!!this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }

    this.query = this.query.select('-__v');

    return this;
  }

  paginate() {
    const { page = 1, limit = 100 } = this.queryString;

    const skip = (Number(page) - 1) * Number(limit);

    this.query = this.query.skip(skip).limit(Number(limit));

    return this;
  }
}

module.exports = { APIFeatures };
