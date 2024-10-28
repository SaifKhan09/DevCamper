const advanceFiltering = (model,populate) => async (req,res,next) => {
    let query;

    // copy req.query
    const reqQuery = { ...req.query };
  
    // Fields to exclude
    const removeFields = ["select", "sort", "limit", "page"];
    removeFields.forEach((field) => delete reqQuery[field]);
    let queryStr = JSON.stringify(reqQuery);
  
    // Add filters lessthan,greaterthan etc
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in|eq)\b/g,
      (match) => `$${match}`
    );
    
    // fetch results
    query = model.find(JSON.parse(queryStr))
  
    // Select Fields to display if req.query.select is present
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }
    console.log(req.query.select)
  
    // Add sorting if req.query.sort is present
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    }
    else{
      query = query.sort('name')
    }

    // Populate
    if(populate){
    query = query.populate(populate)
    }
  
    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page-1)*limit
    const endIndex = page*limit
    const total = await model.countDocuments()
  
    query = query.skip(startIndex).limit(limit)
    
    const results = await query;
    // Pagination result
    let pagination = {}
    if(endIndex < total){
      pagination.next = {
        page : page+1,
        limit : limit  
      }
    }
  
    if(startIndex > 0){
      pagination.prev = {
        page : page - 1,
        limit: limit
      }
    }
    res.advanceResults = {
        success:true,
        pagination: pagination,
        data: results,
        count: results.length
    }

    next()
}

module.exports = advanceFiltering