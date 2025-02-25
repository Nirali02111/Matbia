import {
  animate,
  animation,
  keyframes,
  style,
  state,
  transition,
  trigger,
  useAnimation,
  group,
} from '@angular/animations';

export const shake = animation(
  animate(
    '{{ timing }}s {{ delay }}s',
    keyframes([
      style({ transform: 'translate3d(0, 0, 0)', offset: 0 }),
      style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.1 }),
      style({ transform: 'translate3d(10px, 0, 0)', offset: 0.2 }),
      style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.3 }),
      style({ transform: 'translate3d(10px, 0, 0)', offset: 0.4 }),
      style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.5 }),
      style({ transform: 'translate3d(10px, 0, 0)', offset: 0.6 }),
      style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.7 }),
      style({ transform: 'translate3d(10px, 0, 0)', offset: 0.8 }),
      style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.9 }),
      style({ transform: 'translate3d(0, 0, 0)', offset: 1 }),
    ])
  ),
  { params: { timing: 1, delay: 0 } }
);

export const shakeTrigger = trigger('shakeTrigger', [
  state('false, true', style({})),
  transition('false => true', useAnimation(shake)),
]);

export const SlideInOutAnimation = [
  trigger('slideDownUp', [
    state(
      'in',
      style({
        'max-height': '500px',
        opacity: '1',
        visibility: 'visible',
      })
    ),
    state(
      'out',
      style({
        'max-height': '0px',
        opacity: '0',
        visibility: 'hidden',
      })
    ),
    transition('in => out', [
      group([
        animate(
          '400ms ease-in-out',
          style({
            opacity: '0',
          })
        ),
        animate(
          '600ms ease-in-out',
          style({
            'max-height': '0px',
          })
        ),
        animate(
          '700ms ease-in-out',
          style({
            visibility: 'hidden',
          })
        ),
      ]),
    ]),
    transition('out => in', [
      group([
        animate(
          '1ms ease-in-out',
          style({
            visibility: 'visible',
          })
        ),
        animate(
          '600ms ease-in-out',
          style({
            'max-height': '500px',
          })
        ),
        animate(
          '800ms ease-in-out',
          style({
            opacity: '1',
          })
        ),
      ]),
    ]),
  ]),
];
