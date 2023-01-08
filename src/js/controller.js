import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';

// import 'core-js';
// import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0.update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());

    //1.updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2.loading recipe
    await model.loadRecipe(id);
    // const { recipe } = model.state;

    //3.rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1.get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2.load search results
    await model.loadSearchResults(query);
    //3.render results
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4.render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

// controlSearchResults();

const controlPagination = function (goToPage) {
  // console.log('Pag controller');
  // console.log(goToPage);
  //1.render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2.render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);

const controlAddBookmark = function () {
  //1.add/remove bookmark000
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2.update recipe view
  // console.log(model.state.recipe);
  recipeView.update(model.state.recipe);

  //3.renedr bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💣💣', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Testing pushing again');
};

init();
