export function numberToWords(num: number): string {
  if (num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const nRegex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/;

  const getStr = (n: number): string => {
    let str = '';
    const nStr = ('000000000' + n).slice(-9);
    const match = nStr.match(nRegex);
    if (!match) return '';

    // match[1]: crores
    if (parseInt(match[1]) > 0) {
      str += (parseInt(match[1]) < 20 ? a[parseInt(match[1])] : b[parseInt(match[1][0])] + ' ' + a[parseInt(match[1][1])]) + ' Crore ';
    }
    // match[2]: lakhs
    if (parseInt(match[2]) > 0) {
      str += (parseInt(match[2]) < 20 ? a[parseInt(match[2])] : b[parseInt(match[2][0])] + ' ' + a[parseInt(match[2][1])]) + ' Lakh ';
    }
    // match[3]: thousands
    if (parseInt(match[3]) > 0) {
      str += (parseInt(match[3]) < 20 ? a[parseInt(match[3])] : b[parseInt(match[3][0])] + ' ' + a[parseInt(match[3][1])]) + ' Thousand ';
    }
    // match[4]: hundreds
    if (parseInt(match[4]) > 0) {
      str += a[parseInt(match[4])] + ' Hundred ';
    }
    // match[5]: tens
    if (parseInt(match[5]) > 0) {
      if (str !== '') str += 'and ';
      str += (parseInt(match[5]) < 20 ? a[parseInt(match[5])] : b[parseInt(match[5][0])] + ' ' + a[parseInt(match[5][1])]);
    }
    return str.trim();
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);

  let result = 'INR ' + getStr(rupees);
  if (paise > 0) {
    result += ' and ' + getStr(paise) + ' Paise';
  }
  return result + ' Only';
}
