const deleteProduct = btn => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');

  fetch(`/admin/product/${prodId}`, {
    method: 'DELETE',
    headers: { 'csrf-token': csrf },
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
      productElement.remove();
      // productElement.parentNode.removeChild(productElement); //INFO: this would also work for Internet Explorer
    })
    .catch(err => console.error(err));
};
