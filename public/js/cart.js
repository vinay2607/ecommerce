if (document.readyState == 'loading')
{
  document.addEventListener('DOMContentLoaded', ready)
} else
{
  ready()
}


function ready()
{


  var quantityInputs = document.getElementsByClassName('quantities');
  for (var i = 0; i < quantityInputs.length; i++)
  {
    var input = quantityInputs[i]
    input.addEventListener('change', quantityChanged)
  }

  finalcost();

  var remove = document.getElementsByClassName("remove");

  for (var i = 0; i < remove.length; i++)
  {
    var removes = remove[i];
    removes.addEventListener("click", Remove);
  }
}

function Remove(event)
{
  event.target.parentElement.parentElement.remove()
  finalcost();
}

function finalcost()
{
  var price = document.getElementsByClassName("cartprice");
  var quantitys = document.getElementsByClassName("quantities");
  var cost = 0;

  for (var i = 0; i < price.length; i++)
  {
    var quantity = quantitys[i].value
    cost = cost + parseInt(price[i].innerText, 10) * quantity;


  }

  document.getElementsByClassName("totalprice")[0].innerHTML = cost;
}


function quantityChanged(event)
{
  var input = event.target
  if (isNaN(input.value) || input.value <= 0)
  {
    input.value = 1
  }
  finalcost();
}







