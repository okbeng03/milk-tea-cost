module.exports = {
  parse (recipe) {
    const recipes = recipe.split(';')
    const result = []
    recipes.forEach(item => {
      if (item) {
        const [name, quantity] = item.split(':')
        result.push({
          name,
          quantity: quantity - 0
        })
      }
    })

    return result
  }
}
