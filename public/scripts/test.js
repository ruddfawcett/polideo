$(document).ready(() => {
  $('#start').on('click', () => {
    slide();
  });

  $('.likert-reaction').on('click', () => {
    slide();
  });
});

function slide() {
  $('.current').animate({ left: '-150%' }, 500, () => {});
  $('.current').next().addClass('current');

  $('.current').last().animate({ left: '50%' }, 500, () => {
    $('.current').first().removeClass('current');
  });

  let count = $('.container').children().length - 2;
  let idx = $('.current').index();

  if (idx != count) {
    $('.fill').animate({ width: `${idx / count * 100}%` }, 500);
    $('footer h5').text(`${count - idx} / ${count} Remaining`);
    $('footer h5').animate({ opacity: 1.0 }, 500);
  }
  else {
    $('.test-container').addClass('left');
    $('footer').remove();
  }
}

var Test = {
  start: () => {

  }
}
