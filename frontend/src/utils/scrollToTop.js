/**
 * Utility function to scroll to top of page
 * Can be used for programmatic scrolling
 */
export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior
  });
};

/**
 * Utility function to scroll to a specific element
 */
export const scrollToElement = (elementId, behavior = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: behavior,
      block: 'start'
    });
  }
};

export default scrollToTop;