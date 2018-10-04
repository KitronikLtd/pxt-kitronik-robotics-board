// Test file for the Kitronik All-in-one Robotics Board
// On start up, Stepper 1 will be set to have 200 steps in one full rotation
// On pressing button A on the micro:bit: 
//     A stepper motor connected to motor outputs 1 & 2 will turn 180 degrees
//     Motors connected to outputs 3 & 4 will turn in opposite directions at different speeds
//     4 servos will turn one direction, 4 will turn the other
// On pressing button B on the micro:bit: 
//     A stepper motor connected to motor outputs 1 & 2 will turn 100 steps in the opposite direction to button A
//     Motors connected to outputs 3 & 4 will turn off
//     8 servos will set to the 90 degree position
// On pressing button A+B on the micro:bit:
//     All motor and servo outputs will be turned off
input.onButtonPressed(Button.A, () => {
    Kitronik_Robotics_Board.stepperMotorTurnAngle(Kitronik_Robotics_Board.StepperMotors.Stepper1, Kitronik_Robotics_Board.MotorDirection.Forward, 180)
    Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor3, Kitronik_Robotics_Board.MotorDirection.Forward, 10)
    Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor4, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo1, 180)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo2, 180)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo3, 180)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo4, 180)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo5, 0)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo6, 0)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo7, 0)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo8, 0)
})
input.onButtonPressed(Button.B, () => {
    Kitronik_Robotics_Board.stepperMotorTurnSteps(Kitronik_Robotics_Board.StepperMotors.Stepper1, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
    Kitronik_Robotics_Board.motorOff(Kitronik_Robotics_Board.Motors.Motor3)
    Kitronik_Robotics_Board.motorOff(Kitronik_Robotics_Board.Motors.Motor4)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo1, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo2, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo3, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo4, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo5, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo6, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo7, 90)
    Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo8, 90)
})
input.onButtonPressed(Button.AB, () => {
    Kitronik_Robotics_Board.allOff()
})
Kitronik_Robotics_Board.setStepperMotorSteps(Kitronik_Robotics_Board.StepperMotors.Stepper1, 200)