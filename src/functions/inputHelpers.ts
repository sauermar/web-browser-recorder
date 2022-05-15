import {
  ONE_PERCENT_OF_VIEWPORT_H,
  ONE_PERCENT_OF_VIEWPORT_W
} from "../constants/const";
import { Coordinates } from '../components/atoms/canvas';

export const throttle = (callback: any, limit: number) => {
  let wait = false;
  return (...args: any[]) => {
    if (!wait) {
      callback(...args);
      wait = true;
      setTimeout(function () {
        wait = false;
      }, limit);
    }
  }
}

export const getMappedCoordinates = (
  event: MouseEvent,
  canvas: HTMLCanvasElement | null,
  browserWidth: number,
  browserHeight: number,
): Coordinates => {
  const clientCoordinates = getCoordinates(event, canvas);
  console.log(clientCoordinates);
  const mappedX = mapPixelFromSmallerToLarger(
    browserWidth / 100,
    ONE_PERCENT_OF_VIEWPORT_W,
    clientCoordinates.x,
  );
  const mappedY = mapPixelFromSmallerToLarger(
    browserHeight / 100,
    ONE_PERCENT_OF_VIEWPORT_H,
    clientCoordinates.y,
  );

  return {
    x: mappedX,
    y: mappedY
  };
};

const getCoordinates = (event: MouseEvent, canvas: HTMLCanvasElement | null): Coordinates => {
  if (!canvas) {
    return { x: 0, y: 0};
  }
  return {
    x: event.pageX - canvas.offsetLeft,
    y: event.pageY - canvas.offsetTop
  };
};

const mapPixelFromSmallerToLarger = (
  onePercentOfSmallerScreen: number,
  onePercentOfLargerScreen: number,
  pixel: number
) : number => {
  const xPercentOfScreen = pixel / onePercentOfSmallerScreen;
  return Math.round(xPercentOfScreen * onePercentOfLargerScreen);
};
