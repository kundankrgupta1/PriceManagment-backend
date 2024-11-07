const generateOTP = () => {
	return Math.random(0, 9).toString().slice(2, 8)
}
export default generateOTP;
