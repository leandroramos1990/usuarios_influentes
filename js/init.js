(function($){
  $(function(){

    //$('.button-collapse').sideNav();
    var urlInteractions = 'https://raw.githubusercontent.com/alexandre-gauge/frontend_data/master/interactions.json';
    var urlUsers = 'https://raw.githubusercontent.com/alexandre-gauge/frontend_data/master/users.json';
    var urlBrands = 'https://raw.githubusercontent.com/alexandre-gauge/frontend_data/master/brands.json';
    var currentMode = 'table';

    $.get('templates/list.html', function(data){
        $('div#template').html(data);
        start();
    });

    function start(){
      $.getJSON(urlUsers, function(data){ setUsers(data) });
    }

    function setUsers(users){
      $.getJSON(urlInteractions, function(data){ setInteractions(users, data) });
    }

    function setInteractions(users, interactions){
      $.getJSON(urlBrands, function(data){ setData(users, interactions, data) });
    }

    /** Principal Function **/
    function setData(users, interactions, brands){
      var totalInteractions = interactions.length;
      var brands = setBrands(brands);
      itens = countInteractions(users, interactions, brands);
      users = sortUsers(itens.users);
      appendUsers(itens.users, itens.brands);
      $('.progress').addClass('hide');
    }

    function setBrands(brands){
      imagesBrands = [];
      $(brands).each(function(index, brand){
        brands[brand.id] = {image : brand.image, name: brand.name, interactions: 0};
      });
      return brands;
    }

    function countInteractions(users, interactions, brands){
      $(users).each(function(indexUser, user){
        user.totalInteractions = 0;
        user.interactions = [];
        $(interactions).each(function(indexInteaction, interaction){
            if(user.id == interaction.user){
              user.totalInteractions++;
              user.interactions.push({brand: interaction.brand, type: interaction.type});
              brands[interaction.brand].interactions++;
            }
        });
        users[indexUser] = user;
      });
      var itens = {users: users, brands: brands};
      return itens;
    }

    function sortUsers(users){
      function compare(a,b) {
        if (a.totalInteractions < b.totalInteractions)
          return -1;
        if (a.totalInteractions > b.totalInteractions)
          return 1;
        return 0;
      }

      users.sort(compare);
      users.reverse();
      return users;
    }

    function appendUsers(users, brands){
      var template = $('div#template').find('li.collection-item');
      $('div#template').html('');
      var ul = $('ul').removeClass().addClass('collection');

      $(users).each(function(index, user){
        li = template;
        li = mountItem(li, user, brands);
        ul.append(li);
      });

      $(ul).find('li').eq(0).remove();
      $("div#principal").html(ul);
      $("ul#nav-mobile").remove();
      $('.progress').addClass('hide');
      setDataTable();
      createPieChart(brands);
    }

    function mountItem(li, user, brands){
      $(li).find('img').attr('src', user.picture.thumbnail);
      $(li).find('span.title').text(user.name.title+' '+user.name.first+' '+user.name.last);
      $(li).find('p.gender').text(user.gender);
      $(li).find('p.totalInteractions').text('Total de interações: '+user.totalInteractions);
      $(li).find('span.email').text(user.email);
      $(li).find('span.cell').text(user.cell);
      $(li).find('span.phone').text(user.phone);

      $(li).find('span.address').text(user.location.street + ', ' +
                                      user.location.city + ', ' +
                                      user.location.state + ' - ' +
                                      user.location.postcode
                                    );
      $(li).find('span.nat').text(user.nat);
      li = setTable(li, user.interactions, brands);
      return li;
    }

    function setTable(li, interactions, brands){
      var content = '';
      $(interactions).each(function(index, interaction){
        newContent = "<tr>"+
    			             "<td>"+interaction.type+"</td>"+
                       "<td>"+brands[interaction.brand].name+"</td>"+
    			             "<td><img src="+brands[interaction.brand].image+" /></td>"+
    		             "</tr>";
        content = content + newContent;
      });
      $(li).find('div#interactions table tbody').html(content);
      return li;
    }

    $('html').delegate('.collapsible', 'click', function(){
      $(this).collapsible();
    });

    function setDataTable(){
      $('table.interactions').DataTable();
    }

    function createPieChart(brands){
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Task');
        data.addColumn('number', 'Hours per Day');

        $(brands).each(function(index, brand){
          data.addRows([
            [brand.name, brand.interactions],
          ]);
        });

        var options = {
          title: 'Interações com marcas'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));
        chart.draw(data, options);
      }
    }

  }); // end of document ready
})(jQuery); // end of jQuery name space
