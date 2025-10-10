import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Type definitions
interface TableProps<T = any> {
  headers: string[];
  data: T[][];
  columnWidths?: number[];
  onRowPress?: (row: T[], rowIndex: number) => void;
  headerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  rowStyle?: ViewStyle;
  cellStyle?: ViewStyle;
  cellTextStyle?: TextStyle;
}

interface TableStyles {
  container: ViewStyle;
  headerRow: ViewStyle;
  headerCell: ViewStyle;
  headerText: TextStyle;
  dataRow: ViewStyle;
  evenRow: ViewStyle;
  dataCell: ViewStyle;
  cellText: TextStyle;
  exampleContainer: ViewStyle;
  title: TextStyle;
}

export const Table = <T extends string | number>({
  headers,
  data,
  columnWidths,
  onRowPress,
  headerStyle,
  headerTextStyle,
  rowStyle,
  cellStyle,
  cellTextStyle,
}: TableProps<T>) => {
  return (
    <View style={styles.container}>
      {/* Horizontal ScrollView for entire table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header Row */}
          <View style={[styles.headerRow, headerStyle]}>
            {headers.map((header: string, index: number) => (
              <View
                key={`header-${index}`}
                style={[
                  styles.headerCell,
                  { width: columnWidths ? columnWidths[index] : 150 },
                ]}
              >
                <Text
                  style={[styles.headerText, headerTextStyle]}
                  numberOfLines={1}
                >
                  {header}
                </Text>
              </View>
            ))}
          </View>

          {/* Data Rows - Vertical ScrollView */}
          <ScrollView showsVerticalScrollIndicator={true}>
            {data.map((row: T[], rowIndex: number) => (
              <TouchableOpacity
                key={`row-${rowIndex}`}
                style={[
                  styles.dataRow,
                  rowIndex % 2 === 0 && styles.evenRow,
                  rowStyle,
                ]}
                onPress={() => onRowPress && onRowPress(row, rowIndex)}
                disabled={!onRowPress}
                activeOpacity={onRowPress ? 0.7 : 1}
              >
                {row.map((cell: T, cellIndex: number) => (
                  <View
                    key={`cell-${rowIndex}-${cellIndex}`}
                    style={[
                      styles.dataCell,
                      { width: columnWidths ? columnWidths[cellIndex] : 150 },
                      cellStyle,
                    ]}
                  >
                    <Text
                      style={[styles.cellText, cellTextStyle]}
                      numberOfLines={2}
                    >
                      {String(cell)}
                    </Text>
                  </View>
                ))}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create<TableStyles>({
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    borderBottomWidth: 2,
    borderBottomColor: '#357abd',
  },
  headerCell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  dataCell: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  exampleContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
});
