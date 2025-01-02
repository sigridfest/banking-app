import React, { useRef } from "react"
import { View, Text, Animated, StyleSheet } from "react-native"
import { PanGestureHandler } from "react-native-gesture-handler"
import { Transaction } from "@/backend/types/transaction"

type PaymentBubbleProps = {
  payment: Transaction
  accountID: string
  name: string
  showDateDivider: boolean
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
}

const MAX_SWIPE_DISTANCE = 50

const PaymentBubble: React.FC<PaymentBubbleProps> = ({
  payment,
  accountID,
  name,
  showDateDivider,
  formatDate,
  formatTime,
}) => {
  const panX = useRef(new Animated.Value(0)).current
  const isSentByUser = payment.account_id_from === accountID

  const handleGesture = Animated.event([{ nativeEvent: { translationX: panX } }], {
    useNativeDriver: false,
    listener: (event: any) => {
      const translationX = event.nativeEvent.translationX

      if (isSentByUser) {
        if (translationX < -MAX_SWIPE_DISTANCE) {
          panX.setValue(-MAX_SWIPE_DISTANCE)
        } else if (translationX > 0) {
          panX.setValue(0)
        }
      } else {
        if (translationX > MAX_SWIPE_DISTANCE) {
          panX.setValue(MAX_SWIPE_DISTANCE)
        } else if (translationX < 0) {
          panX.setValue(0)
        }
      }
    },
  })

  const handleGestureEnd = () => {
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: false,
    }).start()
  }

  return (
    <View>
      {showDateDivider && <Text style={styles.dateDivider}>{formatDate(new Date(payment.date.seconds * 1000))}</Text>}
      <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleGestureEnd}>
        <Animated.View
          style={[
            styles.messageContainer,
            {
              transform: [{ translateX: panX }],
              alignSelf: isSentByUser ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text style={isSentByUser ? styles.timeRight : styles.timeLeft}>
            {formatTime(new Date(payment.date.seconds * 1000))}
          </Text>
          <View style={[styles.messageBubble, isSentByUser ? styles.send : styles.receive]}>
            <Text style={styles.statusText}>{isSentByUser ? `Du sendte ${name}` : `${name} sendte deg`}</Text>
            <Text style={{ fontSize: 24 }}>{new Intl.NumberFormat("nb-NO").format(payment.amount)} kr</Text>
            {payment.description && <Text style={styles.statusText}>{payment.description}</Text>}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  )
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 6,
    marginHorizontal: 20,
    maxWidth: "70%",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    gap: 5,
    maxWidth: "100%",
  },
  send: {
    backgroundColor: "#f8d7da",
    borderBottomRightRadius: 2,
  },
  receive: {
    backgroundColor: "#d1e7dd",
    borderBottomLeftRadius: 2,
  },
  statusText: {
    fontSize: 16,
  },
  dateDivider: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    color: "#555",
  },
  timeRight: {
    position: "absolute",
    right: -60,
    bottom: 0,
    color: "#999",
  },
  timeLeft: {
    position: "absolute",
    left: -55,
    bottom: 0,
    color: "#999",
  },
})

export default PaymentBubble
