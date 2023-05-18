const replaceHtml = (selector, html) => {
  const element = document.getElementById(selector);
  if (element) element.innerHTML = html;
};
const appendText = (selector, text) => {
  const element = document.getElementById(selector);
  if (element) element.innerText += text;
};
addEventListener('DOMContentLoaded', () => {
  window.electronAPI.showDevices((_event, devices) => {
    const html = devices
      .map(
        (device) =>
          `<div><b>Manufacturer:</b> ${device.manufacturer}<p><b>Product</b>:${
            device.product || '[blank]'
          }<br/><b>Path</b>:${device.path || '[blank]'}<br/><b>VendorId</b>:${
            device.vendorId
          } <b>ProductId</b>:${device.productId}</p></div>`
      )
      .join('');
    replaceHtml('devices', html);
  });

  window.electronAPI.onBarcodeScan((_event, result) =>
    appendText('results', `vid: ${result.vid}, pid: ${result.pid}, data: ${result.data}`)
  );
});
