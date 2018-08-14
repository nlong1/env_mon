var SenseEntry = mongoose.model('SenseEntry', {
  created: Date,
  temperature: Number,
  humidity: Number,
  pressure: Number
});
