// const bodyParser = require("body-parser");
const express = require("express");

const STATUS_USER_ERROR = 422;

// This array of posts persists in memory across requests. Feel free
// to change this to a let binding if you need to reassign it.
let posts = [];
let id = 1;
const server = express();
server.use(express.json());
// to enable parsing of json bodies for post requests
// server.use(express.json());
const PATH = "/posts";
// TODO: your code to handle requests
server.post(PATH, (req, res) => {
  const { author, title, contents } = req.body;
  console.log(author, title, contents);
  if (!author || !title || !contents) {
    return res.status(STATUS_USER_ERROR).json({
      error: "No se recibieron los parámetros necesarios para crear el Post",
    });
  }
  const post = {
    author,
    title,
    contents,
    id: id++,
  };
  posts.push(post);
  res.status(200).json(post);
});

server.post(`${PATH}/author/:author`, (req, res) => {
  let { author } = req.params;
  let { title, contents } = req.body;
  if (!author || !title || !contents) {
    return res.status(STATUS_USER_ERROR).json({
      error: "No se recibieron los parámetros necesarios para crear el Post",
    });
  }
  const post = {
    author,
    title,
    contents,
    id: id++,
  };
  posts.push(post);
  res.status(200).json(post);
});

server.get(PATH, (req, res) => {
  let { term } = req.query;
  if (term) {
    const term_posts = posts.filter(
      (e) => e.title.includes(term) || e.contents.includes(term)
    );
    return res.json(term_posts);
  }
  res.json(posts);
});

server.get(`${PATH}/:author`, (req, res) => {
  let { author } = req.params;
  const post_author = posts.filter((e) => e.author === author);
  if (post_author.length > 0) {
    res.json(post_author);
  } else {
    return res.status(STATUS_USER_ERROR).json({
      error: "No existe ningun post del autor indicado",
    });
  }
});

server.get(`${PATH}/:author/:title`, (req, res) => {
  let { author, title } = req.params;
  if (author && title) {
    const new_posts = posts.filter(
      (p) => p.author === author && p.title === title
    );
    if (new_posts.length > 0) {
      res.json(new_posts);
    } else {
      return res.status(STATUS_USER_ERROR).json({
        error: "No existe ningun post con dicho titulo y autor indicado",
      });
    }
  } else {
    return res.status(STATUS_USER_ERROR).json({
      error: "No existe ningun post con dicho titulo y autor indicado",
    });
  }
});

server.put(PATH, (req, res) => {
  let { id, title, contents } = req.body;
  if (id && title && contents) {
    let post = posts.find((e) => e.id === parseInt(id)); //se hace el parce para que id sea string, si no habia que ahcer ==
    if (post) {
      post.title = title;
      post.contents = contents;
      res.json(post);
    } else {
      res.status(STATUS_USER_ERROR).json({
        error: "ID no existe",
      });
    }
  } else {
    res.status(STATUS_USER_ERROR).json({
      error:
        "No se recibieron los parámetros necesarios para modificar el Post",
    });
  }
});

server.delete(PATH, (req, res) => {
  let { id } = req.body;

  let post = posts.find((e) => e.id === parseInt(id));

  if (!id || !post) {
   return res.status(STATUS_USER_ERROR).json({ error: "Mensaje de error" });
  }
  posts = posts.filter((e) => e.id !== parseInt(id));
  res.json({ success: true });
});


server.delete('/author', (req, res) => {
  let { author } = req.body;

  let post = posts.find((e) => e.author === author);

  if (!author || !post) {
    return res
      .status(STATUS_USER_ERROR)
      .json({ error: "No existe el autor indicado" });
  }
  let deleteAuthor = [];
  posts = posts.filter((e) => {
    if(e.author !== author){
        return true;
  }else{
    deleteAuthor.push(e)
  }});
  res.json(deleteAuthor);
});

module.exports = { posts, server };
