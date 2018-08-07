/**
 * Blocks for driving the Kitronik All-in-one Robotics Board
 */
//% weight=100 color=#00A654 icon="\uf1b6" block="Robotics"
//% groups='["Servos", "Motors"]'
namespace Kitronik_Robotics_Board
{	
    //Constants 
    let PRESCALE_REG = 0xFE //the prescale register address
    let MODE_1_REG = 0x00  //The mode 1 register address
    
    // If you wanted to write some code that stepped through the servos then this is the Base and size to do that 	
	let SERVO_1_REG_BASE = 0x08 
    let SERVO_REG_DISTANCE = 4
	//To get the PWM pulses to the correct size and zero offset these are the default numbers. 
    let SERVO_MULTIPLIER = 226
    let SERVO_ZERO_OFFSET = 0x66

    // List of servos for the servo block to use. These represent register offsets in the PCA9865 driver IC.
    export enum Servos {
        //% block="Servo 1"
        Servo1 = 0x08,
        //% block="Servo 2"
        Servo2 = 0x0C,
        //% block="Servo 3"
        Servo3 = 0x10,
        //% block="Servo 4"
        Servo4 = 0x14,
        //% block="Servo 5"
        Servo5 = 0x18,
        //% block="Servo 6"
        Servo6 = 0x1C,
        //% block="Servo 7"
        Servo7 = 0x20,
        //% block="Servo 8"
        Servo8 = 0x24
    }

    // List of motors for the motor blocks to use. These represent register offsets in the PCA9865 driver IC.
    export enum Motors {
        //% block="Motor 1"
        Motor1 = 0x28,
        //% block="Motor 2"
        Motor2 = 0x30,
        //% block="Motor 3"
        Motor3 = 0x38,
        //% block="Motor 4"
        Motor4 = 0x40
    }

    // List of stepper motors for the stepper motor blocks to use.
    // Stepper 1 would connect to Motor 1 & Motor 2
    // Stepper 2 would connect to Motor 3 & Motor 4
    export enum StepperMotors {
        //% block="Stepper 1"
        Stepper1,
        //% block="Stepper 2"
        Stepper2
    }

    // Directions the motors can rotate.
    export enum MotorDirection {
        //% block="Forward"
        Forward,
        //% block="Reverse"
        Reverse
    }

    // The Robotics board can be configured to use differnet I2C addresses, these are all listed here.
    // Board1 is the default value (set as the CHIP_ADDRESS)
	export enum BoardAddresses{
		Board1 = 0x6C,
        Board2 = 0x6D,
        Board3 = 0x6E,
        Board4 = 0x6F
	}

    // chipAddress can be changed in 'JavaScript' mode if you have altered the I2C address of the board:
    // 'Kitronik_Robotics_Board.chipAddress = Kitronik_Robotics_Board.BoardAddresses.Boardx' ('x' is one of the BoardAddresses)
    export let chipAddress = BoardAddresses.Board1 //default Kitronik Chip address for All-in-One Robotics Board

    let initalised = false //a flag to allow us to initialise without explicitly calling the secret incantation
    let motorSteps = 200 //Default value for the majority of stepper motors

    //Trim the servo pulses. These are here for advanced users, and not exposed to blocks.
    //It appears that servos I've tested are actually expecting 0.5 - 2.5mS pulses, 
    //not the widely reported 1-2mS 
    //that equates to multiplier of 226, and offset of 0x66
    // a better trim function that does the maths for the end user could be exposed, the basics are here 
	// for reference
    export function trimServoMultiplier(Value: number) {
        if (Value < 113) {
            SERVO_MULTIPLIER = 113
        }
        else {
            if (Value > 226) {
                SERVO_MULTIPLIER = 226
            }
            else {
                SERVO_MULTIPLIER = Value
            }

        }
    }
    export function trimServoZeroOffset(Value: number) {
        if (Value < 0x66) {
            SERVO_ZERO_OFFSET = 0x66
        }
        else {
            if (Value > 0xCC) {
                SERVO_ZERO_OFFSET = 0xCC
            }
            else {
                SERVO_ZERO_OFFSET = Value
            }

        }
    }

	/*
		This secret incantation sets up the PCA9865 I2C driver chip to be running at 50Hz pulse repetition, and then sets the 16 output registers to 1.5mS - centre travel.
		It should not need to be called directly be a user - the first servo write will call it.
	*/
	function secretIncantation(): void {
        let buf = pins.createBuffer(2)

        //Should probably do a soft reset of the I2C chip here when I figure out how

        // First set the prescaler to 50 hz
        buf[0] = PRESCALE_REG
        buf[1] = 0x85 //50Hz
        pins.i2cWriteBuffer(chipAddress, buf, false)
        //Block write via the all leds register to set all of them to 90 degrees
        buf[0] = 0xFA
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
        buf[0] = 0xFB
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
        buf[0] = 0xFC
        buf[1] = 0x66
        pins.i2cWriteBuffer(chipAddress, buf, false)
        buf[0] = 0xFD
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
        //Set the mode 1 register to come out of sleep
        buf[0] = MODE_1_REG
        buf[1] = 0x01
        pins.i2cWriteBuffer(chipAddress, buf, false)
        //set the initalised flag so we dont come in here again automatically
        initalised = true
    }
	
    /**
     * Sets the requested servo to the reguested angle.
	 * If the PCA has not yet been initialised calls the initialisation routine.
     * @param servo Which servo to set
	 * @param degrees the angle to set the servo to
     */
    //% subcategory=Servos
    //% group=Servos
    //% blockId=kitronik_I2Cservo_write
    //% block="set%Servo|to%degrees|degrees"
    //% weight=100 blockGap=8
	//% degrees.min=0 degrees.max=180
    export function servoWrite(servo: Servos, degrees: number): void {
        if (initalised == false) {
            secretIncantation()
        }
        let buf = pins.createBuffer(2)
        let highByte = false
        let deg100 = degrees * 100
        let pwmVal100 = deg100 * SERVO_MULTIPLIER
        let pwmVal = pwmVal100 / 10000
        pwmVal = pwmVal + SERVO_ZERO_OFFSET
        if (pwmVal > 0xFF) {
            highByte = true
        }
        buf[0] = servo
        buf[1] = pwmVal
        pins.i2cWriteBuffer(chipAddress, buf, false)
        if (highByte) {
            buf[0] = servo + 1
            buf[1] = 0x01
        }
        else {
            buf[0] = servo + 1
            buf[1] = 0x00
        }
        pins.i2cWriteBuffer(chipAddress, buf, false)
    }

    /**
     * Sets the requested motor running in chosen direction at a set speed.
     * if the PCA has not yet been initialised calls the initialisation routine.
     * @param motor which motor to turn on
     * @param dir   which direction to go
     * @param speed how fast to spin the motor
     */
    //% subcategory=Motors
    //% group=Motors
    //% blockId=kitronik_motor_on
    //% block="%motor|on direction %dir|speed %speed"
    //% weight=100 blockGap=8
    //% speed.min=0 speed.max=100
    export function motorOn(motor: Motors, dir: MotorDirection, speed: number): void {
        if (initalised == false) {
            secretIncantation()
        }

        /*convert 0-100 to 0-4095 (approx) We wont worry about the last 95 to make life simpler*/
        let outputVal = Math.clamp(0, 100, speed) * 40;

        let buf = pins.createBuffer(2)
        let highByte = false

        switch (dir) {
            case MotorDirection.Forward:
                if (outputVal > 0xFF) {
                    highByte = true
                }

                buf[0] = motor
                buf[1] = outputVal
                pins.i2cWriteBuffer(chipAddress, buf, false)

                if (highByte) {
                    buf[0] = motor + 1
                    buf[1] = outputVal/256
                }
                else {
                    buf[0] = motor + 1
                    buf[1] = 0x00
                }
                pins.i2cWriteBuffer(chipAddress, buf, false)

                buf[0] = motor + 4
                buf[1] = 0x00
                pins.i2cWriteBuffer(chipAddress, buf, false)
                buf[0] = motor + 5
                buf[1] = 0x00
                pins.i2cWriteBuffer(chipAddress, buf, false)
                break
            case MotorDirection.Reverse:
                if (outputVal > 0xFF) {
                    highByte = true
                }
                buf[0] = motor + 4
                buf[1] = outputVal
                pins.i2cWriteBuffer(chipAddress, buf, false)
                if (highByte) {
                    buf[0] = motor + 5
                    buf[1] = outputVal/256
                }
                else {
                    buf[0] = motor + 5
                    buf[1] = 0x00
                }
                pins.i2cWriteBuffer(chipAddress, buf, false)

                buf[0] = motor
                buf[1] = 0x00
                pins.i2cWriteBuffer(chipAddress, buf, false)
                buf[0] = motor + 1
                buf[1] = 0x00
                pins.i2cWriteBuffer(chipAddress, buf, false)
                break
        }            
    }   

    /**
     * Turns off the specified motor.
     * @param motor which motor to turn off
     */
    //% subcategory=Motors
    //% group=Motors
    //% blockId=kitronik_motor_off
    //% weight=95 blockGap=8
    //%block="turn off %motor"
    export function motorOff(motor: Motors): void {

    	let buf = pins.createBuffer(2)

        buf[0] = motor
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
        buf[0] = motor + 1
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
        buf[0] = motor + 4
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
        buf[0] = motor + 5
        buf[1] = 0x00
        pins.i2cWriteBuffer(chipAddress, buf, false)
    }

    /**
     * Turns off all motors and servos.
     */
    //% blockId=kitronik_robotics_all_off
    //% weight=100 blockGap=8
    //%block="turn off all outputs"
    export function allOff(): void {
        let buf = pins.createBuffer(2)
        let servoOffCount = 0
        let servoStartReg = Servos.Servo1
        let servoRegCount = 0

        motorOff(Motors.Motor1)
        motorOff(Motors.Motor2)
        motorOff(Motors.Motor3)
        motorOff(Motors.Motor4)

        while (servoOffCount < 8) {
            buf[0] = servoStartReg + servoRegCount
            buf[1] = 0x00
            pins.i2cWriteBuffer(chipAddress, buf, false)
            buf[0] = servoStartReg + servoRegCount + 1
            buf[1] = 0x00
            pins.i2cWriteBuffer(chipAddress, buf, false)

            servoRegCount += 4
            servoOffCount += 1
        }
    }

    // Set the number of steps per full rotation for a stepper motor
    // motorSteps is defaulted to 200
    // This function can be called in the 'JavaScript' mode by writing: 
    // 'Kitronik_Robotics_Board.setStepperMotorSteps(x)' where 'x' is the new number of steps
    export function setStepperMotorSteps(stepperSteps: number): void {
        motorSteps = stepperSteps
    }

    /**
     * Sets the requested stepper motor to a chosen angle relative to the start position.
     * if the PCA has not yet been initialised calls the initialisation routine.
     * @param stepper which stepper motor to turn on
     * @param dir   which direction to go
     * @param angle how far to turn the motor relative to start
     */
    //% subcategory=Motors
    //% group=Motors
    //% blockId=kitronik_stepper_motor_turn_angle
    //% block="%stepper|turn %dir|%angle|degrees"
    //% weight=90 blockGap=8
    //% angle.min=1 angle.max=360
    export function stepperMotorTurnAngle(stepper: StepperMotors, dir: MotorDirection, angle: number): void 
    {
        if (initalised == false) 
        {
            secretIncantation()
        }

        //convert angle to motor steps
        let angleToSteps = pins.map(angle, 1, 360, 1, motorSteps) 

        turnStepperMotor(stepper, dir, angleToSteps)
    }

    /**
     * Sets the requested stepper motor to turn a set number of steps.
     * if the PCA has not yet been initialised calls the initialisation routine.
     * @param stepper which stepper motor to turn on
     * @param dir   which direction to go
     * @param stepperSteps how many steps to turn the motor
     */
    //% subcategory=Motors
    //% group=Motors
    //% blockId=kitronik_stepper_motor_turn_steps
    //% block="%stepper|turn %dir|%steps|steps"
    //% weight=85 blockGap=8
    //% step.min=1 step.max=motorSteps
    export function stepperMotorTurnSteps(stepper: StepperMotors, dir: MotorDirection, stepperSteps: number): void 
    {
        if (initalised == false) 
        {
            secretIncantation()
        }

        turnStepperMotor(stepper, dir, stepperSteps)
    }

    // The function called to actually turn the stepper motor a set number of steps
    function turnStepperMotor(stepper: StepperMotors, dir: MotorDirection, steps: number): void {
        let stepCounter = 0
        let stepStage1 = 1
        let stepStage2 = 1 
        switch (stepper) 
        {
            case StepperMotors.Stepper1:
                while (stepCounter < steps) 
                {
                    switch (stepStage1) 
                    {
                        case 1:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor1, Kitronik_Robotics_Board.MotorDirection.Forward, 100)
                            basic.pause(20)
                            break
                        case 2:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor2, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
                            basic.pause(20)
                            break
                        case 3:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor1, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
                            basic.pause(20)
                            break
                        case 4:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor2, Kitronik_Robotics_Board.MotorDirection.Forward, 100)
                            basic.pause(20)
                            break
                    }

                    switch (dir) 
                    {
                        case MotorDirection.Forward:
                            if (stepStage1 == 4) 
                            {
                                stepStage1 = 1
                            }
                            else 
                            {
                                stepStage1 += 1
                            }
                            break
                        case MotorDirection.Reverse:
                            if (stepStage1 == 1) 
                            {
                                stepStage1 = 4
                            }
                            else 
                            {
                                stepStage1 -= 1
                            }
                            break
                    }
                    stepCounter += 1
                }
                break
            case StepperMotors.Stepper2:
                while (stepCounter < steps) 
                {
                    switch (stepStage2) 
                    {
                        case 1:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor3, Kitronik_Robotics_Board.MotorDirection.Forward, 100)
                            basic.pause(20)
                            break
                        case 2:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor4, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
                            basic.pause(20)
                            break
                        case 3:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor3, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
                            basic.pause(20)
                            break
                        case 4:
                            Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor4, Kitronik_Robotics_Board.MotorDirection.Forward, 100)
                            basic.pause(20)
                            break
                    }

                    switch (dir) 
                    {
                        case MotorDirection.Forward:
                            if (stepStage2 == 4) 
                            {
                                stepStage2 = 1
                            }
                            else 
                            {
                                stepStage2 += 1
                            }
                            break
                        case MotorDirection.Reverse:
                            if (stepStage2 == 1) 
                            {
                                stepStage2 = 4
                            }
                            else 
                            {
                                stepStage2 -= 1
                            }
                            break
                    }
                    stepCounter += 1
                }
                break 
        }
    }
}